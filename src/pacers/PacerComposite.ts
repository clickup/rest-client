import maxBy from "lodash/maxBy";
import type Pacer from "./Pacer";

/**
 * A Pacer which runs all sub-pacers and chooses the largest delay.
 */
export default class PacerComposite implements Pacer {
  readonly name = "";

  constructor(private _pacers: Pacer[]) {}

  async touch() {
    const delays = await Promise["all"](
      this._pacers.map(async (pacer) => ({
        pacer,
        delay: await pacer.touch(),
      })),
    );
    const pair = maxBy(delays, ({ delay }) => delay.delayMs);
    return pair
      ? {
          ...pair.delay,
          reason: pair.pacer.name
            ? `${pair.pacer.constructor.name} ${pair.pacer.name}\n${pair.delay.reason}`
            : pair.delay.reason,
        }
      : { delayMs: 0, reason: "no pacers" };
  }
}
