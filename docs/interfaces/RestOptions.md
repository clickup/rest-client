[@clickup/rest-client](../README.md) / [Exports](../modules.md) / RestOptions

# Interface: RestOptions

Options passed to RestClient. More options can be added by cloning an
instance of RestClient, withOption() method.

## Properties

### retries

• **retries**: `number`

Max number of retries. Default is 0, because some requests are from the
web app, and we don't want to retry them.

#### Defined in

[src/RestOptions.ts:69](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L69)

___

### retryDelayFirstMs

• **retryDelayFirstMs**: `number`

How much time to wait by default on the 1st retry attempt.

#### Defined in

[src/RestOptions.ts:71](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L71)

___

### retryDelayFactor

• **retryDelayFactor**: `number`

How much to increase the retry delay on each retry.

#### Defined in

[src/RestOptions.ts:73](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L73)

___

### retryDelayJitter

• **retryDelayJitter**: `number`

Use this fraction (random) of the current retry delay to jitter both ways
(e.g. 0.1 means 90%...110% of the delay to be actually applied).

#### Defined in

[src/RestOptions.ts:76](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L76)

___

### retryDelayMaxMs

• **retryDelayMaxMs**: `number`

Maximum delay between each retry.

#### Defined in

[src/RestOptions.ts:78](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L78)

___

### heartbeater

• **heartbeater**: `Object`

A logic which runs on different IO stages (delay and heartbeats).

#### Type declaration

| Name | Type |
| :------ | :------ |
| `heartbeat` | () => `Promise`<`void`\> |
| `delay` | (`ms`: `number`) => `Promise`<`void`\> |

#### Defined in

[src/RestOptions.ts:80](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L80)

___

### throwIfResIsBigger

• **throwIfResIsBigger**: `undefined` \| `number`

Allows to limit huge requests and throw instead.

#### Defined in

[src/RestOptions.ts:91](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L91)

___

### privateDataInResponse

• **privateDataInResponse**: `boolean`

Passed to the logger which may decide, should it log details of the
response or not.

#### Defined in

[src/RestOptions.ts:94](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L94)

___

### allowInternalIPs

• **allowInternalIPs**: `boolean`

If true, non-public IP addresses are allowed too; otherwise, only unicast
addresses are allowed.

#### Defined in

[src/RestOptions.ts:97](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L97)

___

### isDebug

• **isDebug**: `boolean`

If true, logs request-response pairs to console.

#### Defined in

[src/RestOptions.ts:99](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L99)

___

### keepAlive

• **keepAlive**: `Object`

Sets Keep-Alive parameters (persistent connections).

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `timeout` | `number` | A hint to the server, how much time to keep the connection alive. Not all the servers respect it though (e.g. nginx and express do not). |
| `max` | `number` | How many requests are allowed to be processed in one connection. |
| `maxSockets?` | `number` | How many sockets at maximum will be kept open. |

#### Defined in

[src/RestOptions.ts:103](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L103)

___

### family

• **family**: ``0`` \| ``4`` \| ``6``

When resolving DNS, use IPv4, IPv6 or both (see dns.lookup() docs).

#### Defined in

[src/RestOptions.ts:113](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L113)

___

### timeoutMs

• **timeoutMs**: `number`

Max timeout to wait for a response.

#### Defined in

[src/RestOptions.ts:115](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L115)

___

### logger

• **logger**: (`event`: [`RestLogEvent`](RestLogEvent.md)) => `void`

#### Type declaration

▸ (`event`): `void`

Logger to be used for each responses (including retried) plus for backoff
delay events logging.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`RestLogEvent`](RestLogEvent.md) |

##### Returns

`void`

#### Defined in

[src/RestOptions.ts:118](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L118)

___

### middlewares

• **middlewares**: [`Middleware`](Middleware.md)[]

Middlewares to wrap requests. May alter both request and response.

#### Defined in

[src/RestOptions.ts:120](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L120)

___

### isSuccessResponse

• **isSuccessResponse**: (`res`: [`RestResponse`](../classes/RestResponse.md)) => ``"SUCCESS"`` \| ``"THROW"`` \| ``"BEST_EFFORT"``

#### Type declaration

▸ (`res`): ``"SUCCESS"`` \| ``"THROW"`` \| ``"BEST_EFFORT"``

If set, makes decision whether the response is successful or not. The
response will either be returned to the client, or an error will be thrown.
This allows to treat some non-successful HTTP statuses as success if the
remote API is that weird. Return values:
* "SUCCESS" - the request will be considered successful, no further checks
  will be performed;
* "BEST_EFFORT" - inconclusive, the request may be either successful or
  unsuccessful, additional tests (e.g. will check HTTP status code) will be
  performed;
* "THROW" - the request resulted in error. Additional tests will be
  performed to determine is the error is retriable, is OAuth token good,
  and etc.

##### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`RestResponse`](../classes/RestResponse.md) |

##### Returns

``"SUCCESS"`` \| ``"THROW"`` \| ``"BEST_EFFORT"``

#### Defined in

[src/RestOptions.ts:134](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L134)

___

### isRateLimitError

• **isRateLimitError**: (`res`: [`RestResponse`](../classes/RestResponse.md)) => `number` \| ``"BEST_EFFORT"`` \| ``"SOMETHING_ELSE"`` \| ``"RATE_LIMIT"``

#### Type declaration

▸ (`res`): `number` \| ``"BEST_EFFORT"`` \| ``"SOMETHING_ELSE"`` \| ``"RATE_LIMIT"``

Decides whether the response is a rate-limit error or not. Returning
non-zero value is treated as retry delay (if retries are set up). In case
the returned value is "SOMETHING_ELSE", the response ought to be either
success or some other error. Returning "BEST_EFFORT" turns on built-in
heuristic (e.g. relying on HTTP status code and Retry-After header). In
case we've made a decision that it's a rate limited error, the request is
always retried; this covers a very common case when we have both
isRateLimitError and isRetriableError handlers set up, and they return
contradictory information; then isRateLimitError wins.

##### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`RestResponse`](../classes/RestResponse.md) |

##### Returns

`number` \| ``"BEST_EFFORT"`` \| ``"SOMETHING_ELSE"`` \| ``"RATE_LIMIT"``

#### Defined in

[src/RestOptions.ts:144](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L144)

___

### isTokenInvalidError

• **isTokenInvalidError**: (`res`: [`RestResponse`](../classes/RestResponse.md)) => `boolean`

#### Type declaration

▸ (`res`): `boolean`

Decides whether the response is a token-invalid error or not. In case it's
not, the response ought to be either success or some other error.

##### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`RestResponse`](../classes/RestResponse.md) |

##### Returns

`boolean`

#### Defined in

[src/RestOptions.ts:149](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L149)

___

### isRetriableError

• **isRetriableError**: (`res`: [`RestResponse`](../classes/RestResponse.md), `_error`: `any`) => `number` \| ``"BEST_EFFORT"`` \| ``"NEVER_RETRY"`` \| ``"RETRY"``

#### Type declaration

▸ (`res`, `_error`): `number` \| ``"BEST_EFFORT"`` \| ``"NEVER_RETRY"`` \| ``"RETRY"``

Called only if we haven't decided earlier that it's a rate limit error.
Decides whether the response is a retriable error or not. In case the
returned value is "NEVER_RETRY", the response ought to be either success or
some other error, but it's guaranteed that the request won't be retried.
Returning "BEST_EFFORT" turns on built-in heuristics (e.g. never retry "not
found" errors). Returning a number is treated as "RETRY", and the next
retry will happen in not less than this number of milliseconds.

##### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`RestResponse`](../classes/RestResponse.md) |
| `_error` | `any` |

##### Returns

`number` \| ``"BEST_EFFORT"`` \| ``"NEVER_RETRY"`` \| ``"RETRY"``

#### Defined in

[src/RestOptions.ts:157](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L157)
