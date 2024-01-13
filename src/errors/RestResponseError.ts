import inspectPossibleJSON from "../internal/inspectPossibleJSON";
import prependNewlineIfMultiline from "../internal/prependNewlineIfMultiline";
import type RestResponse from "../RestResponse";
import RestError from "./RestError";

const RESPONSE_MAX_LEN_IN_ERROR =
  process.env["NODE_ENV"] === "development" ? Number.MAX_SAFE_INTEGER : 2048;

export default class RestResponseError extends RestError {
  readonly res!: RestResponse;

  readonly method: string;
  readonly host: string;
  readonly pathname: string;
  readonly requestArgs: string;
  readonly requestBody: string;
  readonly responseHeaders: string;

  constructor(message: string, res: RestResponse) {
    super(
      `HTTP ${res.status}: ` +
        (message ? `${message}: ` : "") +
        prependNewlineIfMultiline(
          inspectPossibleJSON(res.headers, res.text, RESPONSE_MAX_LEN_IN_ERROR),
        ),
    );
    Object.defineProperty(this, "res", { value: res, enumerable: false }); // hidden from inspect()
    const url = new URL(res.req.url);
    const search = (url.search || "").replace(/^\?/, "");
    this.method = res.req.method;
    this.host = res.req.headers.get("host") || url.host;
    this.pathname = url.pathname;
    this.requestArgs = search.replace(/(?<=[&])/g, "\n");
    this.requestBody = inspectPossibleJSON(
      res.headers,
      res.req.body,
      RESPONSE_MAX_LEN_IN_ERROR,
    );
    this.responseHeaders = [...res.headers]
      .map(([name, value]) => `${name}: ${value}`)
      .join("\n");
    // Don't expose query string parameters in the message as they may contain
    // sensitive information.
    this.message += `\n  ${this.method} ${url.protocol}//${url.host}${url.pathname}`;
  }
}
