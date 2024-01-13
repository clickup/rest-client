import { inspect } from "util";
import sortBy from "lodash/sortBy";
import truncate from "lodash/truncate";

export default function inspectPossibleJSON(
  headers: { get(name: string): string | null },
  text: string | Buffer | NodeJS.ReadableStream,
  maxOutputLen: number,
): string {
  const MAX_LEN_TO_TRY_PARSE = 1024 * 1024;

  if (typeof text === "string" && text.length > MAX_LEN_TO_TRY_PARSE) {
    // Don't even try to JSON-parse if the text is too long.
    return ellipsis(text, maxOutputLen);
  }

  if (text instanceof Buffer) {
    return `<Buffer: ${text.length} bytes>`;
  }

  if (!text || typeof text === "string") {
    if (!(headers.get("content-type") || "").match(/json/)) {
      return ellipsis(text, maxOutputLen);
    }

    try {
      const json = JSON.parse(text);

      if (json && typeof json === "object" && !(json instanceof Array)) {
        // Move error/errors fields on top for better logging. This is a poor
        // man's approach: of course not all APIs return error/errors fields at
        // all, but it's hard to reorder at any other layer of abstraction.
        reorderObjectProps(json, (k) =>
          k === "error" || k === "errors" ? "" : k,
        );
      }

      return ellipsis(
        inspect(json, { depth: 20, compact: true }),
        maxOutputLen,
      );
    } catch (e: any) {
      return ellipsis(text, maxOutputLen);
    }
  }

  return "<Stream>";
}

/**
 * In-place-reorders keys in a given object. The important part is to do it
 * in-place to e.g. be able to alter some @Memoized values.
 */
function reorderObjectProps(
  obj: Record<string, any>,
  ranker: (k: string, v: any) => string | number,
) {
  const entries = Object.entries(obj);
  for (const k in obj) {
    delete obj[k];
  }

  Object.assign(
    obj,
    Object.fromEntries(sortBy(entries, ([k, v]) => ranker(k, v))),
  );
}

function ellipsis(text: any, length: number) {
  return truncate("" + text, { length }).trimEnd();
}
