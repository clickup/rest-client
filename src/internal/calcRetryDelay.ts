import RestContentSizeOverLimitError from "../errors/RestContentSizeOverLimitError";
import RestRateLimitError from "../errors/RestRateLimitError";
import RestRetriableError from "../errors/RestRetriableError";
import RestTokenInvalidError from "../errors/RestTokenInvalidError";
import type RestOptions from "../RestOptions";
import type RestResponse from "../RestResponse";

/**
 * Returns a new retry delay of the error needs to be retried, otherwise
 * "no_retry".
 */
export default function calcRetryDelay(
  error: any,
  options: RestOptions,
  res: RestResponse,
  retryDelayMs: number,
): number | "no_retry" {
  if (
    error instanceof RestRateLimitError ||
    error instanceof RestRetriableError
  ) {
    // We've already made a decision to retry this error.
    return Math.min(
      options.retryDelayMaxMs,
      Math.max(retryDelayMs, error.delayMs),
    );
  }

  switch (options.isRetriableError(res, error)) {
    case "RETRY":
    default:
      break; // number returned

    case "BEST_EFFORT":
      if (error instanceof RestTokenInvalidError) {
        return "no_retry";
      }

      if (
        !(error instanceof RestRateLimitError) &&
        res.status >= 400 &&
        res.status <= 499
      ) {
        return "no_retry";
      }

      if (error instanceof RestContentSizeOverLimitError) {
        // Content size ... over limit.
        return "no_retry";
      }

      break;

    case "NEVER_RETRY":
      return "no_retry";
  }

  return retryDelayMs;
}
