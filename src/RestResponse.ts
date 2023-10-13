import { Memoize } from "fast-typescript-memoize";
import type { Headers } from "node-fetch";
import type RestRequest from "./RestRequest";

/**
 * RestResponse is intentionally not aware of the data structure it carries, and
 * it doesn't do any assertions/validations which is the responsibility of
 * RestRequest helper methods.
 *
 * We also use a concept of "body preloading". Sometimes, e.g. on non-successful
 * HTTP status codes, we also need to know the body content (at least its
 * beginning), do double check whether should we retry, throw through or through
 * a user-friendly error. To do this, we need to preload the beginning of the
 * body and make it a part of RestResponse abstraction.
 */
export default class RestResponse {
  constructor(
    public readonly req: RestRequest,
    public readonly status: number,
    public readonly headers: Headers,
    public readonly text: string,
    public readonly textIsPartial: boolean
  ) {}

  /**
   * A safe way to treat the response as JSON.
   * - Never throws, i.e. we imply that the caller will verify the structure of
   *   the response and do its own errors processing.
   * - It's a getter, so we can use typescript-is'es is<xyz>() type guard, e.g.:
   *   `if (is<{ errors: any[] }>(res.json) && res.json.errors.length) { ... }`
   *
   * Notice that there is NO `assert()` abstraction inside RestResponse class.
   * This is because RestClient sometimes substitutes the response with some
   * sub-field (e.g. see writeGraphQLX() method), and we still need to run the
   * assertion in such cases. By not having strong typing here, we intentionally
   * make the use of this method harder, so people will prefer using
   * RestRequest.json() instead.
   */
  @Memoize()
  get json(): object | string | number | boolean | null | undefined {
    try {
      return this.text ? JSON.parse(this.text) : undefined;
    } catch (e: any) {
      return undefined;
    }
  }
}
