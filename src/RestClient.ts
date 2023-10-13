import crypto from "crypto";
import isUndefined from "lodash/isUndefined";
import omitBy from "lodash/omitBy";
import { Headers } from "node-fetch";
import OAuth1 from "oauth-1.0a";
import RestTokenInvalidError from "./errors/RestTokenInvalidError";
import RestRangeUploader from "./internal/RestRangeUploader";
import substituteParams from "./internal/substituteParams";
import type RestOptions from "./RestOptions";
import { DEFAULT_OPTIONS } from "./RestOptions";
import RestRequest from "./RestRequest";
import type RestResponse from "./RestResponse";

/**
 * A callback which returns access token, possibly after refreshing it, and also
 * possibly before a retry on "invalid token" condition. I.e. it can be called
 * once or twice (the 2nd time after the previous request error, and that error
 * will be passed as a parameter).
 */
export interface TokenGetter<TData = string> {
  (prevError: Error | null): Promise<TData>;
}

/**
 * RestClient is an immutable object which allows to:
 * 1. Send remote requests in different formats, in a caller-friendly manner.
 * 2. Create a new RestClient objects deriving the current set of options and
 *    adding new ones.
 */
export default class RestClient {
  private readonly _options: RestOptions;

  constructor(options: Partial<RestOptions> = {}) {
    this._options = {
      ...DEFAULT_OPTIONS,
      ...omitBy(options, isUndefined), // undefined === "fallback to default"
      ...(options.keepAlive ? { keepAlive: { ...options.keepAlive } } : {}),
      ...(options.middlewares ? { middlewares: [...options.middlewares] } : {}),
    };
  }

  /**
   * Returns a new RestClient with some options updated with the passed ones.
   */
  withOptions(options: Partial<RestOptions>) {
    return new RestClient({
      ...this._options,
      ...omitBy(options, isUndefined),
    });
  }

  /**
   * Returns a new RestClient with added middleware.
   */
  withMiddleware(
    middleware: RestOptions["middlewares"][0],
    method: "unshift" | "push" = "push"
  ) {
    const clone = new RestClient(this._options);
    clone._options.middlewares[method](middleware);
    return clone;
  }

  /**
   * Returns a new RestClient with the base URL which will be prepended to all
   * relative paths in get(), writeForm() etc. Allows to defer resolution of
   * this base URL to the very late per-request moment. The complicated piece
   * here is that, if we want base URL to be resolved asynchronously, we often
   * times want to reuse the same RestClient object (to e.g. fetch some part of
   * the base URL using already authenticated client). And a re-enterable call
   * appears here which we must protect against in the code below.
   */
  withBase(base: string | (() => Promise<string>)) {
    return this.withMiddleware(async function withBaseMiddleware(req, next) {
      // If URL is already absolute, we don't even need to call base() lambda
      // to resolve it. Return early.
      if (req.url.match(/^\w+:\/\//)) {
        return next(req);
      }

      // Re-enterable call detected, e.g. base() lambda issued a request
      // through the same RestClient. We must just skip setting the base.
      if (base === "") {
        return next(req);
      }

      if (typeof base !== "string") {
        const baseGetter = base;
        base = ""; // disable re-enterable calls
        try {
          base = await baseGetter();
        } catch (e: any) {
          base = baseGetter;
          throw e;
        }
      }

      req.url = new URL(req.url, base).toString();
      return next(req);
    });
  }

  /**
   * Returns a new RestClient with a custom header.
   */
  withHeader(name: string, value: string | (() => Promise<string>)) {
    return this.withMiddleware(async function withHeaderMiddleware(req, next) {
      req.headers.set(name, typeof value === "string" ? value : await value());
      return next(req);
    });
  }

  /**
   * Returns a new RestClient with a bearer token authentication workflow.
   * - RestClient supports interception of options.isTokenInvalid() signal and
   *   conversion it into RestTokenInvalidError exception.
   * - If a token() is a lambda with 1 argument, it may be called the 2nd time
   *   when we get an isTokenInvalid() signal. In this case, the request is
   *   retried.
   * - If token() is a lambda with 0 arguments, that means it doesn't want to
   *   watch for the isTokenInvalid() signal, so there is no sense in retrying
   *   the request either.
   *
   * From the first sight, it looks like options.isTokenInvalid() signal is
   * coupled to setBearer() auth method only. But it's not true:
   * isTokenInvalid() makes sense for ALL authentication methods actually (even
   * for basic auth), and setBearer() is just one of "clients" which implements
   * refreshing/retries on top of isTokenInvalid().
   *
   * Passing the token as lambda allows the caller to implement some complex
   * logic, e.g.:
   * - oauth2 tokens refreshing
   * - marking the token as "revoked" in the database in case the refresh fails
   * - marking the token as "revoked" after a failed request if refresh-token is
   *   not supported
   */
  withBearer(token: TokenGetter, bearerPrefix = "Bearer ") {
    return this.withMiddleware(async function withBearerMiddleware(req, next) {
      return tokenRetryStrategy(token, async (tokenData) => {
        req.headers.set("Authorization", bearerPrefix + tokenData);
        return next(req);
      });
    });
  }

  /**
   * Returns a new RestClient with oauth1 authentication workflow.
   * - In case we get an options.isTokenInvalid() signal, the token() lambda is
   *   called the 2nd time with the error object, then the request is retries.
   *   This gives the lambda a chance to recover or update something in the
   *   database.
   *
   * We use a separate and small oauth-1.0a node library here, because the more
   * popular one (https://www.npmjs.com/package/oauth) doesn't support signing
   * of arbitrary requests, it can only send its own requests.
   */
  withOAuth1(
    consumer: { consumerKey: string; consumerSecret: string },
    token: TokenGetter<{ token: string; tokenSecret: string }>
  ) {
    const oauth = new OAuth1({
      consumer: { key: consumer.consumerKey, secret: consumer.consumerSecret },
      signature_method: "HMAC-SHA1",
      hash_function: (baseString, key) =>
        crypto.createHmac("sha1", key).update(baseString).digest("base64"),
    });

    return this.withMiddleware(async function withOAuth1Middleware(req, next) {
      return tokenRetryStrategy(token, async (tokenData) => {
        const requestData: OAuth1.RequestOptions = {
          url: req.url,
          method: req.method,
          data: req.body,
        };
        const addHeaders = oauth.toHeader(
          oauth.authorize(requestData, {
            key: tokenData.token,
            secret: tokenData.tokenSecret,
          })
        );
        for (const [name, value] of Object.entries(addHeaders)) {
          req.headers.set(name, value);
        }

        return next(req);
      });
    });
  }

  /**
   * Returns a new RestClient with basic authorization workflow.
   */
  withBasic(token: TokenGetter<{ name: string; password: string }>) {
    return this.withMiddleware(async function withBasicMiddleware(req, next) {
      return tokenRetryStrategy(token, async ({ name, password }) => {
        const unencodedHeader = name + ":" + password;
        req.headers.set(
          "Authorization",
          "Basic " + Buffer.from(unencodedHeader).toString("base64")
        );
        return next(req);
      });
    });
  }

  /**
   * Sends a plain GET request without body.
   *
   * NOTE, all args will be passed through `encodeURIComponent`.
   */
  get(
    path: string,
    args: Partial<Record<string, string | number | string[]>> = {},
    accept: string = "application/json"
  ) {
    return this._noBodyRequest(path, args, "GET", accept);
  }

  /**
   * Writes some raw string, buffer or a stream.
   */
  writeRaw(
    path: string,
    body: string | Buffer | NodeJS.ReadableStream,
    contentType: string,
    method: "POST" | "PUT" | "PATCH" = "POST",
    accept?: string
  ) {
    const origShape = simpleShape(path);
    return new RestRequest(
      this._options,
      method,
      path,
      new Headers({
        Accept: accept || contentType,
        "Content-Type": contentType,
      }),
      body,
      origShape
    );
  }

  /**
   * A shortcut method to write JSON body.
   */
  writeJson(
    path: string,
    body: any,
    method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
    accept: string = "application/json"
  ) {
    const origShape = simpleShape(path, body);
    [path, body] = substituteParams(path, body);
    return new RestRequest(
      this._options,
      method,
      path,
      new Headers({
        Accept: accept || "application/json",
        "Content-Type": "application/json",
      }),
      JSON.stringify(body),
      origShape
    );
  }

  /**
   * A shortcut method to write "application/x-www-form-urlencoded" data.
   */
  writeForm(
    path: string,
    body: Partial<Record<string, string>> | string,
    method: "POST" | "PUT" | "PATCH" = "POST",
    accept: string = "application/json"
  ) {
    const origShape = simpleShape(path, body);
    [path, body] = substituteParams(path, body);
    return new RestRequest(
      this._options,
      method,
      path,
      new Headers({
        Accept: accept,
        "Content-Type": "application/x-www-form-urlencoded",
      }),
      typeof body === "string"
        ? body
        : new URLSearchParams(
            omitBy(body, isUndefined) as Record<string, string>
          ).toString(),
      origShape
    );
  }

  /**
   * A shortcut method to write DELETE request.
   */
  writeDelete(
    path: string,
    args: Partial<Record<string, string>> = {},
    accept: string = "application/json"
  ) {
    return this._noBodyRequest(path, args, "DELETE", accept);
  }

  /**
   * Returns a RestRequest prepared for sending GraphQL operation.
   * - Expects the response to contain no errors; throws otherwise.
   * - In case of success, returns just the content of `data` field (this is
   *   different with writeGraphQLNullable() which returns `data` as a separate
   *   fields along with `error` and `errors`).
   */
  writeGraphQLX(query: string, variables: any = {}) {
    const oldIsSuccessResponse = this._options.isSuccessResponse;
    return this.withOptions({
      isSuccessResponse: (res) => {
        const oldIsSuccess = oldIsSuccessResponse?.(res);
        const json: any = res.json;
        return oldIsSuccess === "THROW" ||
          !json?.data ||
          json.error ||
          (json.errors instanceof Array && json.errors.length > 0)
          ? "THROW"
          : "BEST_EFFORT";
      },
    })
      .withMiddleware(async function writeGraphQLXMiddleware(req, next) {
        const res = await next(req);
        const json: any = res.json;
        // Substitute the response json object with just its data field.
        Object.defineProperty(res, "json", { value: json.data });
        return res;
      })

      ._writeGraphQLImpl<any>(query, variables);
  }

  /**
   * Same as writeGraphQLX(), but doesn't throw if GraphQL response contains
   * non-empty `error` or `errors` fields and instead returns the full response.
   * I.e. allows the caller to process these errors.
   */
  writeGraphQLNullable(query: string, variables: any = {}) {
    return this._writeGraphQLImpl<
      { data?: any; error?: any; errors?: any[] } | null | undefined
    >(query, variables);
  }

  /**
   * Performs a series of Content-Range requests with content from a sequence of
   * Buffers.
   */
  async rangeUpload(
    path: string,
    mimeType: string,
    stream: AsyncIterable<Buffer>,
    method: "POST" | "PUT" = "POST",
    chunkSize: number
  ) {
    return new RestRangeUploader(
      this,
      chunkSize,
      method,
      path,
      mimeType
    ).upload(stream);
  }

  private _writeGraphQLImpl<TAssertShape>(query: string, variables: any = {}) {
    const origShape = query;
    // To beautify the query, we remove leading spaces (extracted from the last line).
    query = query.trimEnd();
    if (query.match(/\n([ \t]+)[^\n]+$/)) {
      const prefix = RegExp.$1;
      query = query.replace(new RegExp("^" + prefix, "gm"), "").trimEnd();
    }

    return new RestRequest<TAssertShape>(
      this._options,
      "POST",
      "",
      new Headers({ "Content-Type": "application/json" }),
      JSON.stringify({ variables, query }), // variables first - for truncation in logs,
      origShape
    );
  }

  /**
   * Sends a plain request (with no body, like GET or DELETE).
   */
  private _noBodyRequest(
    path: string,
    args: Partial<Record<string, string | number | string[]>> = {},
    method: "GET" | "DELETE",
    accept: string = "application/json"
  ) {
    const origShape = simpleShape(path, args);
    [path, args] = substituteParams(path, args);
    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries(args)) {
      if (Array.isArray(v)) {
        for (const element of v) {
          searchParams.append(k, element.toString());
        }
      } else if (v !== undefined) {
        searchParams.append(k, v.toString());
      }
    }

    const suffix = searchParams.toString();
    if (suffix !== "") {
      path += (path.includes("?") ? "&" : "?") + suffix;
    }

    return new RestRequest(
      this._options,
      method,
      path,
      new Headers({ Accept: accept }),
      "",
      origShape
    );
  }
}

/**
 * @ignore
 * Calls token(null), then runs body() passing the result there. If we get a
 * RestTokenInvalidError exception, call token() with this error as a parameter
 * and then passes the response to body() again (kinda retry with a new token).
 */
export async function tokenRetryStrategy<TData>(
  token: TokenGetter<TData>,
  body: (tokenData: TData) => Promise<RestResponse>
) {
  let tokenData = await token(null);
  try {
    return await body(tokenData);
  } catch (e: any) {
    const supportsRetry = token.length > 0; // args count
    if (e instanceof RestTokenInvalidError && supportsRetry) {
      tokenData = await token(e);
      try {
        return await body(tokenData);
      } catch (e: any) {
        if (e instanceof RestTokenInvalidError) {
          e.message = `(still failed, even with updated token) ${e.message}`;
        }

        throw e;
      }
    }

    throw e;
  }
}

/**
 * Returns a simple "shape" of a request useful for e.g. grouping by in logger
 * to figure out, which requests are more frequent.
 * - reflects args names and not values
 * - wipes the domain
 * - removes query string parameter values
 */
function simpleShape(path: string, args?: any) {
  path = path.replace(/^\w+:\/\/[^/]+/, "").replace(/=[^&]+/g, "=");

  const argsInPath: string[] = [];
  const regex = /:([a-z0-9_]+)/gi;
  while (true) {
    const match = regex.exec(path);
    if (!match) {
      break;
    } else {
      argsInPath.push(match[1]);
    }
  }

  const keys =
    args && typeof args === "object"
      ? Object.keys(args)
          // Filter out args that are already mentioned in the path, e.g.
          // /pages/:pageID/blocks.
          .filter((arg) => !argsInPath.includes(arg))
          .sort()
          .join(",")
      : "";

  return path + (keys !== "" ? `:${keys}` : "");
}
