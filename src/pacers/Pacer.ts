/**
 * A result of some Pacer work.
 */
export interface PacerDelay {
  delayMs: number;
  reason: string;
}

/**
 * Pacer is a class which allows to pace requests on some resource identified by
 * the instance of this class.
 */
export default interface Pacer {
  /** Human readable name of the pacer, used when composing multiple pacers. */
  readonly name: string;

  /**
   * Signals that we're about to send a request. Returns the delay we need to
   * wait for before actually sending.
   */
  touch(): Promise<PacerDelay>;
}
