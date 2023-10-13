import AbortControllerPolyfilled from "abort-controller";
import { Memoize } from "fast-typescript-memoize";
import type { RequestInit } from "node-fetch";
import fetch, { Headers, Request } from "node-fetch";

export interface RestFetchReaderOptions {
  timeoutMs?: number;
  heartbeat?: () => Promise<void>;
  onTimeout?: (reader: RestFetchReader, e: any) => void;
  onAfterRead?: (reader: RestFetchReader) => void;
}

/**
 * A low-level stateful reader engine on top of node-fetch which implements
 * "preload first N chars and then leave the rest ready for iteration" pattern,
 * with global timeout for the entire fetching time.
 *
 * Once created, the object MUST be iterated in full to consume the rest of the
 * stream and close the connection. In case you're not interested in its entire
 * content, you must prematurely "return" (close) the iterator.
 *
 * The abstraction is intentionally kept independent on all others, to make it
 * simple and testable separately.
 */
export default class RestFetchReader {
  private _status = 0;
  private _headers = new Headers();
  private _textFetched = "";
  private _textIsPartial = true;
  private _charsRead = 0;

  constructor(
    private _url: string,
    private _req: RequestInit,
    private _options: RestFetchReaderOptions
  ) {}

  /**
   * Returns the number of characters read from the stream so far.
   */
  get charsRead() {
    return this._charsRead;
  }

  /**
   * Returns HTTP status after preload() was called.
   */
  get status() {
    return this._status;
  }

  /**
   * Returns HTTP headers after preload() was called.
   */
  get headers() {
    return this._headers;
  }

  /**
   * Returns the data preloaded so far.
   */
  get textFetched(): string {
    return this._textFetched;
  }

  /**
   * If true, then there is a chance that reading more from the stream will
   * return more data.
   */
  get textIsPartial() {
    return this._textIsPartial;
  }

  /**
   * Reads preloadChars chars or a little bit more from the response and puts
   * them to this.textFetched. Leaves the rest of the data in res.body for
   * future reads if there are more data to fetch (you must consume them or
   * close the stream, otherwise the connection will remain open).
   */
  async preload(preloadChars: number) {
    const generator = this[Symbol.asyncIterator]();
    try {
      while (this._charsRead < preloadChars) {
        const { value, done } = await generator.next();
        if (done) {
          this._textIsPartial = false;
          await generator.return();
          return;
        }

        this._textFetched += value;
      }
    } catch (e) {
      await generator.return();
      throw e;
    }
  }

  /**
   * Closes the connection.
   */
  async close() {
    await this[Symbol.asyncIterator]().return();
  }

  /**
   * Returns an async generator for the rest of the data. Must be consumed
   * entirely, otherwise the connection may remain dangling.
   *
   * Memoization is important here, to return the same generator when we call
   * this method multiple times and to not start a new iteration over and over.
   */
  @Memoize()
  async *[Symbol.asyncIterator]() {
    const { timeoutMs, onTimeout, onAfterRead } = this._options;

    // Some of react-client users are still on v14 node.
    const controller =
      typeof AbortController === "undefined"
        ? new AbortControllerPolyfilled()
        : new AbortController();

    const timeout = timeoutMs
      ? setTimeout(() => controller.abort(), timeoutMs)
      : undefined;

    try {
      // DO NOT use fetch(fetchReq) with one argument! It clones the stream
      // which just doesn't work in practice, even with file streams. I wasted
      // 4h on debugging this: fetch(fetchReq.url, fetchReq) works and
      // fetch(fetchReq) doesn't for e.g. Dropbox API and
      // https://stackoverflow.com/a/44577569
      const res = await fetch(
        this._url,
        new Request(this._url, {
          ...this._req,
          signal: controller.signal as any,
        })
      );
      this._status = res.status;
      this._headers = res.headers;

      // An opinionated choice is made here to always decode the response stream
      // as UTF-8. This is because JSON is by definition a UTF-8 stream. In the
      // future, when we need binary streams, we can tweak it by introducing
      // some intermediate layer and doing some refactoring, but for now it's an
      // overkill. See also
      // https://nodejs.org/api/stream.html#readablesetencodingencoding on how
      // Node streams handle decoding when the returned chunks cross the
      // boundaries of multi-byte characters.
      res.body.setEncoding("utf-8");

      await this._options.heartbeat?.();
      for await (const chunk of res.body) {
        await this._options.heartbeat?.();
        this._charsRead += chunk.length;
        yield chunk as string;
        onAfterRead?.(this);
      }
    } catch (e) {
      if (controller.signal.aborted && onTimeout) {
        onTimeout(this, e);
      } else {
        throw e;
      }
    } finally {
      timeout && clearTimeout(timeout);
      // If someone stops iterating prematurely, we forcefully close the
      // connection in all cases. Theoretically, stopping the iteration on
      // res.body should've closed the connection, but in practice it doesn't
      // happen; it looks like a bug in node-fetch, and thus, we must always use
      // the AbortController in the end.
      controller.abort();
    }
  }
}
