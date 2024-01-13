import type RestResponse from "../RestResponse";
import RestResponseError from "./RestResponseError";

export default class RestRateLimitError extends RestResponseError {
  constructor(
    message: string,
    public delayMs: number,
    res: RestResponse,
  ) {
    super(message, res);
  }
}
