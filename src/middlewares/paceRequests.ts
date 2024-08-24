import type { Middleware } from "../RestOptions";
import type RestRequest from "../RestRequest";

const MIN_LOG_DELAY_MS = 10;

/**
 * Pacer is a class which allows to pace requests on some resource identified by
 * the instance of this class.
 */
export interface Pacer {
  /** Human readable name of the pacer, used when composing multiple pacers. */
  readonly key: string;

  /**
   * Signals that we're about to send a request. Returns the delay we need to
   * wait for before actually sending.
   */
  pace(): Promise<PacerOutcome>;
}

/**
 * A result of some Pacer work.
 */
export interface PacerOutcome {
  delayMs: number;
  reason: string;
}

/**
 * Rest Client middleware that adds some delay between requests using one of
 * Pacer implementations.
 */
export default function paceRequests(
  pacer: Pacer | ((req: RestRequest) => Promise<Pacer | null>) | null,
  delayMetric?: (delay: number, reason: string) => void,
): Middleware {
  return async (req, next) => {
    if (typeof pacer === "function") {
      pacer = await pacer(req);
    }

    if (pacer) {
      const { delayMs, reason } = await pacer.pace();

      if (delayMs > 0) {
        delayMetric?.(delayMs, reason);
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
