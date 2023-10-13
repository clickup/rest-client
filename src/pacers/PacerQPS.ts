import random from "lodash/random";
import type { PacerDelay } from "./Pacer";
import type Pacer from "./Pacer";

/** Start decreasing the delay (and thus speeding up requests) only when we have
 * less requests in the moving window than allowed by the desired QPS multiplied
 * by this factor. I.e. we don't speed up immediately when we're slow; we wait
 * until we're SLIGHTLY below the limits. */
const DEFAULT_DECREASE_THRESHOLD = 0.75;

/** Default moving window length. */
const DEFAULT_WINDOW_SEC = 30;

/** Below how many samples do we stop relying on samples to recalculate the
 * current fleet's average delay and instead keep using the previously
 * calculated (and saved) value for the delay. E.g. it doesn't make much sense
 * to rely on an average of 3-4 samples to calculate the average delay, it makes
 * sense to wait for more samples to come. */
const MIN_COUNT_FOR_CENTRAL_TENDENCY = 10;

/** The value here is multiplied by the fleet average to get the delay
 * increment/decrement step. It basically determines, in how many increments
 * would a "cold started" worker reach the current fleet's average delay. Or, in
 * how many steps would it reach delay=0 situation from the current fleet's
 * average if needed.  */
const DELAY_AVG_TO_STEP_FACTOR = 0.02;

/** Delay increments are jittered by +/- this proportion. */
const DELAY_STEP_JITTER = 0.1;

export interface PacerQPSBackend {
  /** Resource key which this backend is operating on. */
  readonly key: string;

  /**
   * Maintains the array of numbers somewhere in memory (time-value pairs),
   * inserts a new time-value pair to the end of this list, and removes all the
   * entries which are earlier than `minTime`. Returns the size of the resulting
   * array and some central tendency statistics about its values.
   */
  push(props: {
    time: number;
    minTime: number;
    value: number;
    minCountForCentralTendency: number;
  }): Promise<{ count: number; sum: number; avg: number; median: number }>;
}

export interface PacerQPSOptions {
  /** The maximum QPS allowed within the rolling window. */
  qps: number;
  /** The length of the rolling windows in milliseconds. */
  windowSec?: number;
  /** Decrease the delay if the number of requests in the window has dropped
   * below `decreaseThreshold` portion of the limit. */
  decreaseThreshold?: number;
}

/**
 * Implements a very simple heuristic:
 * - increase the delay if we're above the QPS within the rolling window;
 * - decrease the delay if we're below the desired QPS.
 *
 * Each worker keeps (and grows/shrinks) its delay individually; this way, we
 * don't need to elect, who's the "source of truth" for the delay.
 *
 * Backend is a concrete (and minimal) implementation of the storage logic for
 * the pacing algorithm.
 */
export default class PacerQPS implements Pacer {
  private _isFirstTouch = true;
  private _delay = 0;

  constructor(
    private _options: PacerQPSOptions,
    private _backend: PacerQPSBackend
  ) {}

  get name() {
    return this._backend.key;
  }

  async touch(): Promise<PacerDelay> {
    const windowSec = this._options.windowSec ?? DEFAULT_WINDOW_SEC;
    const limit = Math.round(windowSec * this._options.qps);
    const decreaseThreshold =
      this._options.decreaseThreshold ?? DEFAULT_DECREASE_THRESHOLD;

    const time = Date.now();
    const delayPushed = this._delay;
    const { count, sum, avg, median } = await this._backend.push({
      time,
      minTime: time - windowSec * 1000,
      value: this._delay,
      minCountForCentralTendency: MIN_COUNT_FOR_CENTRAL_TENDENCY,
    });
    const sumDivCount = count ? sum / count : 0;

    // "Cold start": start with the fleet average delay.
    if (this._isFirstTouch && this._delay === 0) {
      this._delay = Math.round(avg);
      this._isFirstTouch = false;
    }

    // If we imagine there is only 1 worker in the fleet, what would be its
    // delay increment/decrement step. We use this number in a fallback
    // situation, when we don't know much about the entire fleet average delay
    // yet, or when this delay is too small to count on.
    const singleWorkerDelayStepMs = Math.round(
      ((windowSec * 1000) / limit) * DELAY_AVG_TO_STEP_FACTOR
    );

    // Considering that there are multiple workers running, and that the current
    // average fleet's delay is representative, what would be a delay increment
    // to reach from delay=0 to that fleet's average delay.
    const multiWorkerDelayStepMs = Math.round(
      avg *
        DELAY_AVG_TO_STEP_FACTOR *
        random(1 - DELAY_STEP_JITTER, 1 + DELAY_STEP_JITTER, true)
    );

    // If average fleet delay is not representative yet, we fallback to a
    // single-worker delay increment.
    const delayStepMs = multiWorkerDelayStepMs || singleWorkerDelayStepMs || 1;

    if (count > limit) {
      // Increase the delay if the limit is reached. There is no "max delay":
      // imagine we have 10 QPS limit and 10000 users; it's obvious that in this
      // case, the delay between requests per a single user will be gigantic.
      this._delay += delayStepMs;
    } else if (count < limit * decreaseThreshold) {
      // Decrease the delay if we're significantly under the limit.
      this._delay = Math.max(0, this._delay - delayStepMs);
    }

    return {
      delayMs: this._delay,
      reason: [
        `count=${count} per ${windowSec}s (limit=${limit})`,
        `delay=${this._delay} step=${delayStepMs} delayPushed=${delayPushed}`,
        `median=${Math.round(median)}`,
        `sum/count=${Math.round(sumDivCount)}`,
        `avg=${Math.round(avg)}`,
      ].join("\n"),
    };
  }
}
