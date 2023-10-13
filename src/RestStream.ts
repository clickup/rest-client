import { Memoize } from "fast-typescript-memoize";
import type RestResponse from "./RestResponse";

/**
 * Once created, RestStream must be iterated in full, otherwise the connection
 * will remain dangling. Also, this class is where we hide the details of the
 * actual stream reading using AsyncGenerator bridge abstraction.
 */
export default class RestStream {
  private _generator?: AsyncGenerator<string, void>;

  constructor(
    public readonly res: RestResponse,
    readerIterable: {
      [Symbol.asyncIterator]: () => AsyncGenerator<string, void>;
    }
  ) {
    this._generator = readerIterable[Symbol.asyncIterator]();
  }

  /**
   * Reads the prefix of the stream. Closes the connection after the read is
   * done in all cases, so safe to be used to e.g. receive a trimmed response.
   */
  async consumeReturningPrefix(maxChars: number): Promise<string> {
    const text: string[] = [];
    let length = 0;
    for await (const chunk of this) {
      // According to Google, in v8 string concatenation is as efficient as
      // array or buffer joining.
      text.push(chunk);
      length += chunk.length;
      if (length >= maxChars) {
        break;
      }
    }

    return text.join("").substring(0, maxChars);
  }

  /**
   * Closes the connection.
   */
  async close() {
    // First, try to interrupt the active iteration, if any.
    await this[Symbol.asyncIterator]().return();
    // It is possible that this.[Symbol.asyncIterator] has never been iterated
    // before at all, so its `finally` got never executed. This happens when
    // RestFetchReader#preload() consumed some small chunk of data, and then
    // no-one iterated the remaining body in RestStream, they just called
    // close() on it. So we recheck & close the RestFetchReader iterator if it
    // is still there.
    const generator = this._generator;
    if (generator) {
      delete this._generator;
      await generator.return();
    }
  }

  /**
   * Allows to iterate over the entire stream of data. You must consume the
   * entire iterable or at least call this.close(), otherwise the connection may
   * remain open.
   */
  @Memoize()
  async *[Symbol.asyncIterator]() {
    const generator = this._generator;
    if (!generator) {
      return;
    }

    delete this._generator;
    try {
      yield this.res.text;
      for await (const chunk of generator) {
        yield chunk;
      }
    } finally {
      // The code enters here if the caller interrupted (returned) the iteration
      // after receiving the 1st textFetched chunk.
      await generator.return();
    }
  }
}
