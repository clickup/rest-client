import type RestResponse from "../RestResponse";
import RestResponseError from "./RestResponseError";

export default class RestTokenInvalidError extends RestResponseError {
  constructor(public readonly humanReason: string, res: RestResponse) {
    super(humanReason, res);
  }
}
