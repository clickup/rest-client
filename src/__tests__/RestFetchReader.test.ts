import delay from "delay";
import range from "lodash/range";
import {
  BINARY_BUF,
  consumeIterable,
  createFetchReader,
  server,
  serverAssertConnectionsCount,
  TimeoutError,
  UTF8_BUF,
} from "./helpers";

let ORIGIN: string;

beforeAll(async () => {
  ORIGIN = await new Promise((resolve) => {
    server.listen(0, () =>
      resolve("http://127.0.0.1:" + (server.address() as any).port)
    );
  });
});

beforeEach(async () => {
  await serverAssertConnectionsCount(0);
});

test("small_response", async () => {
  const reader = createFetchReader(`${ORIGIN}/small`);
  await reader.preload(1024);

  expect(reader.textFetched).toEqual("ok");
  expect(reader.textIsPartial).toBeFalsy();
  expect(reader.charsRead).toEqual(reader.textFetched.length);

  for await (const _ of reader) {
    throw "Must not return any more data";
  }

  await serverAssertConnectionsCount(0);
});

test("large_response", async () => {
  const reader = createFetchReader(`${ORIGIN}/large`);
  await reader.preload(42);
  await serverAssertConnectionsCount(1);

  expect(reader.textFetched.length).toBeGreaterThan(1);
  expect(reader.textFetched.length).toBeLessThan(1024 * 10);
  expect(reader.textIsPartial).toBeTruthy();
  expect(reader.charsRead).toEqual(reader.textFetched.length);

  const rest = await consumeIterable(reader);
  await serverAssertConnectionsCount(0);
  expect(rest.length).toBeGreaterThan(1);
  expect(reader.textIsPartial).toBeTruthy();
  expect(reader.charsRead).toEqual(reader.textFetched.length + rest.length);
});

test("slow_response", async () => {
  const reader = createFetchReader(`${ORIGIN}/slow`);
  await reader.preload(42);
  await delay(300);
  await serverAssertConnectionsCount(1);
  await reader[Symbol.asyncIterator]().return();
  await serverAssertConnectionsCount(0);
});

test("small_slow_utf8_response", async () => {
  const reader = createFetchReader(`${ORIGIN}/small_slow_utf8`);
  await reader.preload(1);
  await serverAssertConnectionsCount(1);
  expect(reader.textFetched.length).toEqual(1);
  expect(reader.charsRead).toEqual(1);
  const rest = await consumeIterable(reader);
  expect(reader.textFetched + rest).toEqual(UTF8_BUF.toString());
  await serverAssertConnectionsCount(0);
});

test("too_big_response", async () => {
  const reader = createFetchReader(`${ORIGIN}/large`, {
    onAfterRead: (reader) => {
      if (reader.charsRead > 1024 * 64) {
        throw Error("too large");
      }
    },
  });
  await reader.preload(42);
  await serverAssertConnectionsCount(1);
  await expect(async () => consumeIterable(reader, 10)).rejects.toThrow(
    "too large"
  );
  await serverAssertConnectionsCount(0);
});

test("timeout_response_no_preload_long_read_delay", async () => {
  const reader = createFetchReader(`${ORIGIN}/slow`, { timeoutMs: 200 });
  await expect(async () => consumeIterable(reader, 500)).rejects.toThrow(
    TimeoutError
  );
  await serverAssertConnectionsCount(0);
});

test("timeout_response_no_preload_short_read_delay", async () => {
  const reader = createFetchReader(`${ORIGIN}/slow`, { timeoutMs: 200 });
  await expect(async () => consumeIterable(reader, 10)).rejects.toThrow(
    TimeoutError
  );
  await serverAssertConnectionsCount(0);
});

test("timeout_in_preload", async () => {
  const reader = createFetchReader(`${ORIGIN}/slow`, { timeoutMs: 200 });
  await expect(async () => reader.preload(10000000)).rejects.toThrow(
    TimeoutError
  );
  await serverAssertConnectionsCount(0);
});

test("timeout_in_stream_after_preload_succeeded", async () => {
  const reader = createFetchReader(`${ORIGIN}/slow`, { timeoutMs: 200 });
  await reader.preload(42);
  await serverAssertConnectionsCount(1);
  await expect(async () => consumeIterable(reader, 10)).rejects.toThrow(
    TimeoutError
  );
  await serverAssertConnectionsCount(0);
});

test("timeout_after_reader_waited_for_too_long", async () => {
  const reader = createFetchReader(`${ORIGIN}/slow`, { timeoutMs: 200 });
  await reader.preload(42);
  await serverAssertConnectionsCount(1);
  await delay(500);
  await expect(async () => consumeIterable(reader, 10)).rejects.toThrow(
    TimeoutError
  );
  await serverAssertConnectionsCount(0);
});

test("read_binary_data", async () => {
  const reader = createFetchReader(`${ORIGIN}/binary`, { timeoutMs: 2000 });
  await reader.preload(42);
  const preload = reader.textFetched;
  expect(reader.textIsPartial).toBeTruthy();
  const data = await consumeIterable(reader, 10);
  expect(Buffer.from(preload + data, "binary")).toEqual(
    Buffer.concat(range(10).map(() => BINARY_BUF))
  );
  await serverAssertConnectionsCount(0);
});
