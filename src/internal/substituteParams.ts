/**
 * Allows to use URLs like /some/:abc/other and pass { abc: "xyz" } as one of
 * body parameters. Such body parameters will be excluded from the body before
 * sending the request (so they're "moved" into the URL).
 */
export default function substituteParams<TBody>(
  url: string,
  body: TBody
): [string, TBody] {
  if (!body || typeof body !== "object") {
    return [url, body];
  }

  url = url.replace(/:([a-z0-9_]+)/gi, (match, param) => {
    const value = (body as any)[param];
    if (typeof value === "string" || typeof value === "number") {
      body = { ...body };
      delete (body as any)[param];
      return encodeURIComponent(value);
    }

    return match;
  });
  return [url, body];
}
