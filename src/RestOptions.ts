import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";
import delay from "delay";
import { Memoize } from "fast-typescript-memoize";
import type RestRequest from "./RestRequest";
import type RestResponse from "./RestResponse";

/**
 * An event which is passed to an external logger (see RestOptions).
 */
export interface RestLogEvent {
  attempt: number;
  req: RestRequest;
  res: RestResponse | "backoff_delay" | null;
  exception: any | null;
  timestamp: number;
  elapsed: number;
  isFinalAttempt: boolean;
  privateDataInResponse: boolean;
  comment: string;
}

/**
 * Middlewares allow to modify RestRequest and RestResponse objects during the
 * request processing.
 */
export interface Middleware {
  (
    req: RestRequest,
    next: (req: RestRequest) => Promise<RestResponse>,
  ): Promise<RestResponse>;
}

/**
 * @ignore
 * Parameters for Agents.
 */
interface AgentOptions {
  keepAlive: boolean;
  timeout?: number;
  maxSockets?: number;
  rejectUnauthorized?: boolean;
  family?: 4 | 6 | 0;
}

/**
 * @ignore
 * An internal class which keeps the list of HttpAgent instances used in a
 * particular RestClient instance.
 */
export class Agents {
  @Memoize((...args: any[]) => JSON.stringify(args))
  http(options: AgentOptions) {
    return new HttpAgent(options);
  }

  @Memoize((...args: any[]) => JSON.stringify(args))
  https(options: AgentOptions) {
    return new HttpsAgent(options);
  }
}

/**
 * Options passed to RestClient. More options can be added by cloning an
 * instance of RestClient, withOption() method.
 */
export default interface RestOptions {
  /** Max number of retries. Default is 0, because some requests are from the
   * web app, and we don't want to retry them. */
  retries: number;
  /** How much time to wait by default on the 1st retry attempt. */
  retryDelayFirstMs: number;
  /** How much to increase the retry delay on each retry. */
  retryDelayFactor: number;
  /** Use this fraction (random) of the current retry delay to jitter both ways
   * (e.g. 0.1 means 90%...110% of the delay to be actually applied). */
  retryDelayJitter: number;
  /** Maximum delay between each retry. */
  retryDelayMaxMs: number;
  /** A logic which runs on different IO stages (delay and heartbeats). */
  heartbeater: {
    /* This function is called after each request with 0 passed, so it can serve
     * the purpose of a heartbeat. */
    heartbeat(): Promise<void>;
    /** A function which, when runs, resolves in the provided number of ms. Can
     * be used for several purposes, like overriding in unit tests or to pass a
     * custom delay implementation which can throw on some external event (like
     * when the process wants to gracefully stop). */
    delay(ms: number): Promise<void>;
  };
  /** Allows to limit huge requests and throw instead. */
  throwIfResIsBigger: number | undefined;
  /** Passed to the logger which may decide, should it log details of the
   * response or not. */
  privateDataInResponse: boolean;
  /** If true, non-public IP addresses are allowed too; otherwise, only unicast
   * addresses are allowed. */
  allowInternalIPs: boolean;
  /** If true, logs request-response pairs to console. */
  isDebug: boolean;
  /** @ignore Holds HttpsAgent/HttpAgent instances; used internally only. */
  agents: Agents;
  /** Sets Keep-Alive parameters (persistent connections). */
  keepAlive: {
    /** How much time to keep an idle connection alive in the pool. If 0, closes
     * the connection immediately after the response. */
    timeoutMs: number;
    /** How many sockets at maximum will be kept open. */
    maxSockets?: number;
  };
  /** When resolving DNS, use IPv4, IPv6 or both (see dns.lookup() docs). */
  family: 4 | 6 | 0;
  /** Max timeout to wait for a response. */
  timeoutMs: number;
  /** Logger to be used for each responses (including retried) plus for backoff
   * delay events logging. */
  logger: (event: RestLogEvent) => void;
  /** Middlewares to wrap requests. May alter both request and response. */
  middlewares: Middleware[];
  /** If set, makes decision whether the response is successful or not. The
   * response will either be returned to the client, or an error will be thrown.
   * This allows to treat some non-successful HTTP statuses as success if the
   * remote API is that weird. Return values:
   * * "SUCCESS" - the request will be considered successful, no further checks
   *   will be performed;
   * * "BEST_EFFORT" - inconclusive, the request may be either successful or
   *   unsuccessful, additional tests (e.g. will check HTTP status code) will be
   *   performed;
   * * "THROW" - the request resulted in error. Additional tests will be
   *   performed to determine is the error is retriable, is OAuth token good,
   *   and etc. */
  isSuccessResponse: (res: RestResponse) => "SUCCESS" | "THROW" | "BEST_EFFORT";
  /** Decides whether the response is a rate-limit error or not. Returning
   * non-zero value is treated as retry delay (if retries are set up). In case
   * the returned value is "SOMETHING_ELSE", the response ought to be either
   * success or some other error. Returning "BEST_EFFORT" turns on built-in
   * heuristic (e.g. relying on HTTP status code and Retry-After header). In
   * case we've made a decision that it's a rate limited error, the request is
   * always retried; this covers a very common case when we have both
   * isRateLimitError and isRetriableError handlers set up, and they return
   * contradictory information; then isRateLimitError wins. */
  isRateLimitError: (
    res: RestResponse,
  ) => "SOMETHING_ELSE" | "RATE_LIMIT" | "BEST_EFFORT" | number;
  /** Decides whether the response is a token-invalid error or not. In case it's
   * not, the response ought to be either success or some other error. */
  isTokenInvalidError: (res: RestResponse) => boolean;
  /** Called only if we haven't decided earlier that it's a rate limit error.
   * Decides whether the response is a retriable error or not. In case the
   * returned value is "NEVER_RETRY", the response ought to be either success or
   * some other error, but it's guaranteed that the request won't be retried.
   * Returning "BEST_EFFORT" turns on built-in heuristics (e.g. never retry "not
   * found" errors). Returning a number is treated as "RETRY", and the next
   * retry will happen in not less than this number of milliseconds. */
  isRetriableError: (
    res: RestResponse,
    _error: any,
  ) => "NEVER_RETRY" | "RETRY" | "BEST_EFFORT" | number;
}

/** @ignore */
export const DEFAULT_OPTIONS: RestOptions = {
  retries: 0,
  retryDelayFirstMs: 1000,
  retryDelayFactor: 2,
  retryDelayJitter: 0.1,
  retryDelayMaxMs: Number.MAX_SAFE_INTEGER,
  heartbeater: {
    heartbeat: async () => {},
    delay,
  },
  throwIfResIsBigger: undefined,
  privateDataInResponse: false,
  allowInternalIPs: false,
  isDebug: false,
  agents: new Agents(),
  keepAlive: { timeoutMs: 10000 },
  family: 4, // we don't want to hit ~5s DNS timeout on a missing IPv6 by default
  timeoutMs: 4 * 60 * 1000,
  logger: () => {},
  middlewares: [],
  isSuccessResponse: () => "BEST_EFFORT",
  isRateLimitError: () => "BEST_EFFORT",
  isTokenInvalidError: () => false,
  isRetriableError: () => "BEST_EFFORT",
};
