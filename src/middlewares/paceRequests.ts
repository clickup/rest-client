import type Pacer from "../pacers/Pacer";
import type { Middleware } from "../RestOptions";
import type RestRequest from "../RestRequest";

const MIN_LOG_DELAY_MS = 10;

/**
 * Rest Client middleware that adds some delay between requests using one of
 * Pacer implementations.
 */
export default function paceRequests(
  pacer: Pacer | ((req: RestRequest) => Promise<Pacer | null>) | null
): Middleware {
  return async (req, next) => {
    if (typeof pacer === "function") {
      pacer = await pacer(req);
    }

    if (pacer) {
      const { delayMs, reason } = await pacer.touch();
      if (delayMs > 0) {
        await req.options.heartbeater.delay(delayMs);
      }

      if (delayMs > MIN_LOG_DELAY_MS) {
        req.options.logger({
          attempt: 0,
          req,
          res: "backoff_delay",
          exception: null,
          timestamp: Date.now(),
          elapsed: delayMs,
          isFinalAttempt: true,
          privateDataInResponse: false,
          comment: reason,
        });
      }
    }

    return next(req);
  };
}
