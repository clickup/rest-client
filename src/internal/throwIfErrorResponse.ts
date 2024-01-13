import RestRateLimitError from "../errors/RestRateLimitError";
import RestResponseError from "../errors/RestResponseError";
import RestRetriableError from "../errors/RestRetriableError";
import RestTokenInvalidError from "../errors/RestTokenInvalidError";
import type RestOptions from "../RestOptions";
import type RestResponse from "../RestResponse";

const STATUS_TOO_MANY_REQUESTS = 429;

/**
 * The general idea is that we turn all logical errors into exceptions and then
 * deal with exceptions only. I.e. throwing an exception becomes an internal API
 * convention for errors. This is because fetch() throws its own exceptions, and
 * also there may be some exceptions during validation of the response, or
 * inside a middleware etc.
 */
export default function throwIfErrorResponse(
  options: RestOptions,
  res: RestResponse,
) {
  const isSuccessResponse = options.isSuccessResponse(res);
  if (isSuccessResponse === "SUCCESS") {
    return;
  }

  const rateLimitDelayMs = options.isRateLimitError(res);
  switch (rateLimitDelayMs) {
    case "RATE_LIMIT":
      throw new RestRateLimitError(
        `isRateLimitError() returned ${rateLimitDelayMs}`,
        0,
        res,
      );
    case "BEST_EFFORT":
      if (res.status === STATUS_TOO_MANY_REQUESTS) {
        const retryAfterHeader = res.headers.get("Retry-After") || "0";
        throw new RestRateLimitError(
          `Rate limited by HTTP status ${STATUS_TOO_MANY_REQUESTS}`,
          parseInt(retryAfterHeader) || 0,
          res,
        );
      }

      break;
    case "SOMETHING_ELSE":
      break;
    default:
      throw new RestRateLimitError(
        `isRateLimitError() returned retry delay ${rateLimitDelayMs} ms`,
        rateLimitDelayMs,
        res,
      );
  }

  const isTokenInvalidError = options.isTokenInvalidError(res);
  if (isTokenInvalidError) {
    throw new RestTokenInvalidError("Invalid app token", res);
  }

  const retryDelayMs = options.isRetriableError(res, null);
  switch (retryDelayMs) {
    case "RETRY":
      throw new RestRetriableError(
        `isRetriableError() returned ${retryDelayMs}`,
        0,
        res,
      );
    case "BEST_EFFORT":
    case "NEVER_RETRY":
      break;
    default:
      throw new RestRetriableError(
        `"isRetriableError() returned retry delay ${retryDelayMs} ms`,
        retryDelayMs,
        res,
      );
  }

  if (isSuccessResponse === "THROW") {
    throw new RestResponseError(
      `isSuccessResponse() returned ${isSuccessResponse}`,
      res,
    );
  }

  if (res.status >= 300) {
    throw new RestResponseError("", res);
  }
}
