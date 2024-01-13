import type RestClient from "../RestClient";

/**
 * Sends a series of Content-Range requests to an URL.
 * - The stream size is unknown in advance even theoretically. So we read it
 *   with chunkSize+1 bytes chunks (+1 is to know for sure, is there something
 *   else left in the stream or not) and then send data with chunkSize bytes
 *   chunks.
 * - The last chunk is a terminating one (and we know, which one is the last),
 *   so we reflect it in "Content-Range: x-y/S" format setting S to the total
 *   number of bytes in the stream.
 */
export default class RestRangeUploader {
  private _pos = 0;

  constructor(
    private _client: RestClient,
    private _chunkSize: number,
    private _method: "POST" | "PUT",
    private _path: string,
    private _mimeType: string,
  ) {}

  async upload(stream: AsyncIterable<Buffer>) {
    let buf = Buffer.allocUnsafe(0);
    let res: string | null = null;
    for await (const readData of stream) {
      buf = Buffer.concat([buf, readData]);
      while (buf.length >= this._chunkSize + 1) {
        res = await this._flush(buf.slice(0, this._chunkSize), false);
        buf = Buffer.from(buf.slice(this._chunkSize));
      }
      // After this `while` loop finishes, there is always something left in buf
      // (due to the +1 trick). It guarantees that we have a chance to call
      // flush(..., true) for the very last chunk.
    }

    if (buf.length > 0) {
      res = await this._flush(buf, true);
    }

    return res;
  }

  private async _flush(buf: Buffer, isLast: boolean) {
    if (buf.length === 0) {
      return null;
    }

    const totalSize = isLast ? this._pos + buf.length : "*";
    const res = await this._client
      .writeRaw(this._path, buf, this._mimeType, this._method, "*/*")
      .setHeader(
        "Content-Range",
        `bytes ${this._pos}-${this._pos + buf.length - 1}/${totalSize}`,
      )
      .text();
    this._pos += buf.length;
    return res;
  }
}
