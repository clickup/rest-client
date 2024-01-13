import Stream from "stream";
import {
  consumeReadable,
  createRestStream,
  server,
  serverAssertConnectionsCount,
} from "./helpers";

let ORIGIN: string;

beforeAll(async () => {
  ORIGIN = await new Promise((resolve) => {
    server.listen(0, () =>
      resolve("http://127.0.0.1:" + (server.address() as any).port),
    );
  });
});

beforeEach(async () => {
  await serverAssertConnectionsCount(0);
});

test("prefix", async () => {
  const stream = await createRestStream(`${ORIGIN}/large`);
  const prefix = await stream.consumeReturningPrefix(42);
  expect(prefix.length).toEqual(42);
  await serverAssertConnectionsCount(0);
});

test("stream_readable_proxy_closes_connection", async () => {
  const stream = await createRestStream(`${ORIGIN}/large`);
  const readable = Stream.Readable.from(stream);
  expect((await consumeReadable(readable)).length).toBeGreaterThan(1024 * 10);
  await serverAssertConnectionsCount(0);
});

test("read_cancelled_after_reading_preloaded_chunk_closes_connection", async () => {
  const stream = await createRestStream(`${ORIGIN}/large`, 42);
  await serverAssertConnectionsCount(1);

  for await (const chunk of stream) {
    expect(chunk).toEqual(stream.res.text);
    await serverAssertConnectionsCount(1);
    break;
  }

  await serverAssertConnectionsCount(0);
});

test("read_thrown_after_reading_preloaded_chunk_closes_connection", async () => {
  const stream = await createRestStream(`${ORIGIN}/large`, 42);
  await serverAssertConnectionsCount(1);

  await expect(async () => {
    for await (const chunk of stream) {
      await serverAssertConnectionsCount(1);
      expect(chunk).toEqual(stream.res.text);
      throw Error("bailout");
    }
  }).rejects.toThrowError("bailout");

  await serverAssertConnectionsCount(0);
});
