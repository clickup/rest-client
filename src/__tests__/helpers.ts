import http from "http";
import type { Readable } from "stream";
import delay from "delay";
import range from "lodash/range";
import { Headers } from "node-fetch";
import { DEFAULT_OPTIONS, RestRequest, RestResponse, RestStream } from "..";
import type { RestFetchReaderOptions } from "../internal/RestFetchReader";
import RestFetchReader from "../internal/RestFetchReader";

// Two European Euro symbols in UTF-8.
export const UTF8_BUF = Buffer.from([0xe2, 0x82, 0xac, 0xe2, 0x82, 0xac]);

// Binary data, all possible bytes.
export const BINARY_BUF = Buffer.from(range(256));

// eslint-disable-next-line @typescript-eslint/no-misused-promises
export const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  // In node-fetch 2.6.13+, they stopped sending "Connection: close" by default:
  // https://github.com/node-fetch/node-fetch/pull/1736 - which is a good thing:
  // we can now send multiple requests through the same connection sequentially
  // (it seems to be broken before). Since RestFetchReader calls
  // controller.abort() when the client wants to interrupt the request, the
  // connection is physically closed only if there is currently an active
  // request (e.g. "/slow" below), and it's not closed when the request is
  // successfully processed (which is, again, a good thing). So to be able to
  // use serverAssertConnectionsCount() helper, we force the server to close the
  // connection after each request, so serverAssertConnectionsCount() can work.
  res.setHeader("Connection", "close");

  // Returns a small response.
  if (req.url === "/small") {
    res.writeHead(200);
    return res.end("ok");
  }

  // Returns a large, but quick response.
  if (req.url === "/large") {
    res.writeHead(200);
    await write(res, 1024);
    await delay(100);
    await write(res, 1024 * 100);
    return res.end("x".repeat(1024 * 200));
  }

  // Returns a large response, does it slowly.
  if (req.url === "/slow") {
    res.writeHead(200);
    for (let timeStart = Date.now(); Date.now() - timeStart < 20000; ) {
      const error = await write(res, 1024);
      if (error) {
        break;
      } else {
        await delay(10);
      }
    }

    return res.end();
  }

  // Returns slow response as UTF-8 bytes, one after another.
  if (req.url === "/small_slow_utf8") {
    res.writeHead(200);
    for (const byte of UTF8_BUF) {
      await write(res, Buffer.from([byte]));
      await delay(500);
    }

    return res.end();
  }

  // Returns a binary response.
  if (req.url === "/binary") {
    res.setHeader("Content-Type", "application/octet-stream");
    res.writeHead(200);
    for (const _ in range(10)) {
      await write(res, BINARY_BUF);
      await delay(50);
    }

    return res.end();
  }

  res.writeHead(404);
  return res.end("not found");
});

export async function serverAssertConnectionsCount(expect: number) {
  let got: number = 0;
  for (let timeStart = Date.now(); Date.now() - timeStart < 10000; ) {
    got = await new Promise((resolve) =>
      server.getConnections((_, count) => resolve(count)),
    );
    if (got === expect) {
      return;
    }

    await delay(50);
  }

  throw Error(`Expected ${expect} connections, but got ${got}`);
}

export class TimeoutError extends Error {}

export function createFetchReader(
  url: string,
  options: RestFetchReaderOptions = {},
) {
  return new RestFetchReader(
    url,
    {},
    {
      onTimeout: () => {
        throw new TimeoutError("timed out");
      },
      ...options,
    },
  );
}

export async function createRestStream(url: string, preloadBytes?: number) {
  const reader = createFetchReader(url);
  if (preloadBytes) {
    await reader.preload(preloadBytes);
  }

  return new RestStream(
    new RestResponse(
      new RestRequest(DEFAULT_OPTIONS, "GET", "dummy", new Headers(), ""),
      reader.agent,
      reader.status,
      reader.headers,
      reader.textFetched.toString(),
      reader.textIsPartial,
    ),
    reader[Symbol.asyncIterator](),
  );
}

export async function consumeIterable(
  iterable: AsyncIterable<string>,
  delayMs?: number,
) {
  let rest = "";
  for await (const chunk of iterable) {
    rest += chunk;
    if (delayMs) {
      await delay(delayMs);
    }
  }

  return rest;
}

export async function consumeReadable(stream: Readable) {
  return new Promise<string>((resolve) => {
    const chunks: string[] = [];
    stream.on("data", (chunk) => {
      chunks.push(chunk);
    });
    stream.on("end", () => {
      resolve(chunks.join(""));
    });
  });
}

async function write(res: http.ServerResponse, bytes: number | Buffer) {
  return new Promise((r) =>
    res.write(typeof bytes === "number" ? "x".repeat(bytes) : bytes, r),
  );
}
