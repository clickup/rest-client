import type RestResponse from "../RestResponse";
import RestResponseError from "./RestResponseError";

export default class RestRetriableError extends RestResponseError {
  constructor(message: string, public delayMs: number, res: RestResponse) {
    super(message, res);
  }
}
