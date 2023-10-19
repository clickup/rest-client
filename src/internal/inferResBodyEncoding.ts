import type { Response } from "node-fetch";

const CHARSET_RE =
  /(?:charset|encoding)\s{0,10}=\s{0,10}['"]? {0,10}([-\w]{1,100})/i;
const BUFFER_ENCODINGS = ["ascii", "utf8", "utf-8", "utf16le", "ucs2", "ucs-2"];

/**
 * Tries its best to infer the encoding of the Response, falling back to UTF-8
 * as an opinionated default value on failure.
 */
export default function inferResBodyEncoding(res: Response): BufferEncoding {
  const contentType = res.headers.get("content-type")?.toLowerCase();
  const charset = contentType?.match(CHARSET_RE)
    ? RegExp.$1.toLowerCase()
    : undefined;
  return contentType?.startsWith("application/octet-stream")
    ? // It's a binary Content-Type.
      "binary"
    : charset && !BUFFER_ENCODINGS.includes(charset)
    ? // The charset is provided in Content-Type, but unknown by Buffer.
      "binary"
    : charset && BUFFER_ENCODINGS.includes(charset)
    ? // Charset is provided in Content-Type header, and Buffer knows
      // how to decode it.
      (charset as BufferEncoding)
    : // An opinionated choice is made here to always default-decode the
      // response stream as UTF-8. This is because JSON is by definition a UTF-8
      // stream, and people often time respond with JSONs forgetting to provide
      // "; charset=utf-8" part of the Content-Type header (or they forget
      // Content-Type header at all, or put some wrong value as "text/plain"
      // there; there is an endless list of mistake variations here).
      "utf-8";
}
