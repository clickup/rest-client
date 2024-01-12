import { FetchError, Headers } from "node-fetch";
import {
  DEFAULT_OPTIONS,
  RestClient,
  RestRateLimitError,
  RestResponseError,
  RestTokenInvalidError,
} from "..";
import calcRetryDelay from "../internal/calcRetryDelay";
import throwIfErrorResponse from "../internal/throwIfErrorResponse";
import RestResponse from "../RestResponse";

const REQUEST = new RestClient().get("https://example.com");
const SUCCESS_RESPONSE = new RestResponse(
  REQUEST,
  null,
  200,
  new Headers(),
  "",
  false
);
const ERROR_RESPONSE = new RestResponse(
  REQUEST,
  null,
  500,
  new Headers(),
  "",
  false
);
const NOT_FOUND_RESPONSE = new RestResponse(
  REQUEST,
  null,
  404,
  new Headers(),
  "",
  false
);
const TOO_MANY_REQUESTS_RESPONSE = new RestResponse(
  REQUEST,
  null,
  429,
  new Headers(),
  "",
  false
);

test("isSuccessResponse", () => {
  expect(
    throwIfErrorResponse(
      { ...DEFAULT_OPTIONS, isSuccessResponse: () => "SUCCESS" },
      ERROR_RESPONSE
    )
  ).toBeUndefined();

  expect(() =>
    throwIfErrorResponse(
      { ...DEFAULT_OPTIONS, isSuccessResponse: () => "BEST_EFFORT" },
      NOT_FOUND_RESPONSE
    )
  ).toThrow(/404/);

  expect(
    throwIfErrorResponse(
      { ...DEFAULT_OPTIONS, isSuccessResponse: () => "BEST_EFFORT" },
      SUCCESS_RESPONSE
    )
  ).toBeUndefined();

  expect(() =>
    throwIfErrorResponse(
      { ...DEFAULT_OPTIONS, isSuccessResponse: () => "THROW" },
      SUCCESS_RESPONSE
    )
  ).toThrow(/isSuccessResponse/);
});

test("isRateLimitError", () => {
  expect(() =>
    throwIfErrorResponse(
      { ...DEFAULT_OPTIONS, isRateLimitError: () => "RATE_LIMIT" },
      SUCCESS_RESPONSE
    )
  ).toThrow(RestRateLimitError);

  expect(
    throwIfErrorResponse(
      { ...DEFAULT_OPTIONS, isRateLimitError: () => "BEST_EFFORT" },
      SUCCESS_RESPONSE
    )
  ).toBeUndefined();

  expect(() =>
    throwIfErrorResponse(
      { ...DEFAULT_OPTIONS, isRateLimitError: () => "BEST_EFFORT" },
      TOO_MANY_REQUESTS_RESPONSE
    )
  ).toThrow(RestRateLimitError);

  expect(
    throwIfErrorResponse(
      { ...DEFAULT_OPTIONS, isRateLimitError: () => "SOMETHING_ELSE" },
      SUCCESS_RESPONSE
    )
  ).toBeUndefined();
});

test("isTokenInvalidError", () => {
  expect(() =>
    throwIfErrorResponse(
      { ...DEFAULT_OPTIONS, isTokenInvalidError: () => true },
      SUCCESS_RESPONSE
    )
  ).toThrow(RestTokenInvalidError);

  expect(
    throwIfErrorResponse(
      { ...DEFAULT_OPTIONS, isTokenInvalidError: () => false },
      SUCCESS_RESPONSE
    )
  ).toBeUndefined();
});

test("isRetriableError", () => {
  expect(() =>
    throwIfErrorResponse(
      { ...DEFAULT_OPTIONS, isRetriableError: () => "RETRY" },
      SUCCESS_RESPONSE
    )
  ).toThrow(RestResponseError);

  expect(
    throwIfErrorResponse(
      { ...DEFAULT_OPTIONS, isRetriableError: () => "BEST_EFFORT" },
      SUCCESS_RESPONSE
    )
  ).toBeUndefined();

  expect(() =>
    throwIfErrorResponse(
      { ...DEFAULT_OPTIONS, isRetriableError: () => "BEST_EFFORT" },
      NOT_FOUND_RESPONSE
    )
  ).toThrow(RestResponseError);

  expect(
    throwIfErrorResponse(
      { ...DEFAULT_OPTIONS, isRateLimitError: () => "SOMETHING_ELSE" },
      SUCCESS_RESPONSE
    )
  ).toBeUndefined();

  expect(() =>
    throwIfErrorResponse(
      { ...DEFAULT_OPTIONS, isRetriableError: () => "NEVER_RETRY" },
      NOT_FOUND_RESPONSE
    )
  ).toThrow(RestResponseError);
});

test("calcRetryDelay", () => {
  expect(
    calcRetryDelay(
      new RestRateLimitError("", 42, SUCCESS_RESPONSE),
      DEFAULT_OPTIONS,
      SUCCESS_RESPONSE,
      0
    )
  ).toEqual(42);

  expect(
    calcRetryDelay(
      new RestTokenInvalidError("", ERROR_RESPONSE),
      DEFAULT_OPTIONS,
      ERROR_RESPONSE,
      0
    )
  ).toEqual("no_retry");

  expect(
    calcRetryDelay(
      new RestTokenInvalidError("", ERROR_RESPONSE),
      { ...DEFAULT_OPTIONS, isRetriableError: () => "RETRY" },
      ERROR_RESPONSE,
      42
    )
  ).toEqual(42);

  expect(
    calcRetryDelay(
      new RestResponseError("", ERROR_RESPONSE),
      { ...DEFAULT_OPTIONS, isRetriableError: () => "BEST_EFFORT" },
      ERROR_RESPONSE,
      42
    )
  ).toEqual(42);

  expect(
    calcRetryDelay(
      new RestResponseError("", NOT_FOUND_RESPONSE),
      { ...DEFAULT_OPTIONS, isRetriableError: () => "BEST_EFFORT" },
      NOT_FOUND_RESPONSE,
      42
    )
  ).toEqual("no_retry");

  expect(
    calcRetryDelay(
      new RestRateLimitError("", 42, NOT_FOUND_RESPONSE),
      { ...DEFAULT_OPTIONS, isRetriableError: () => "BEST_EFFORT" },
      NOT_FOUND_RESPONSE,
      0
    )
  ).toEqual(42);

  expect(
    calcRetryDelay(
      new FetchError("test", "some"),
      {
        ...DEFAULT_OPTIONS,
        isRetriableError: (_: any, error: any) =>
          error instanceof FetchError ? "NEVER_RETRY" : "RETRY",
      },
      NOT_FOUND_RESPONSE,
      0
    )
  ).toEqual("no_retry");

  expect(
    calcRetryDelay(
      new FetchError("test", "max-size"),
      { ...DEFAULT_OPTIONS, isRetriableError: () => "BEST_EFFORT" },
      NOT_FOUND_RESPONSE,
      0
    )
  ).toEqual("no_retry");
});

test("when isRateLimitError=YES, isRetriableError=NO doesn't matter, and the request is always retriable", () => {
  expect(() =>
    throwIfErrorResponse(
      {
        ...DEFAULT_OPTIONS,
        isRateLimitError: () => "RATE_LIMIT",
        isRetriableError: () => "NEVER_RETRY",
      },
      SUCCESS_RESPONSE
    )
  ).toThrow(RestRateLimitError);

  expect(
    calcRetryDelay(
      new RestRateLimitError("", 42, SUCCESS_RESPONSE),
      {
        ...DEFAULT_OPTIONS,
        isRateLimitError: () => "RATE_LIMIT",
        isRetriableError: () => "NEVER_RETRY",
      },
      SUCCESS_RESPONSE,
      0
    )
  ).toEqual(42);
});
