[@clickup/rest-client](../README.md) / [Exports](../modules.md) / RestClient

# Class: RestClient

RestClient is an immutable object which allows to:
1. Send remote requests in different formats, in a caller-friendly manner.
2. Create a new RestClient objects deriving the current set of options and
   adding new ones.

## Constructors

### constructor

• **new RestClient**(`options?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Partial`<[`RestOptions`](../interfaces/RestOptions.md)\> |

#### Defined in

[src/RestClient.ts:33](https://github.com/clickup/rest-client/blob/master/src/RestClient.ts#L33)

## Methods

### withOptions

▸ **withOptions**(`options`): [`RestClient`](RestClient.md)

Returns a new RestClient with some options updated with the passed ones.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Partial`<[`RestOptions`](../interfaces/RestOptions.md)\> |

#### Returns

[`RestClient`](RestClient.md)

#### Defined in

[src/RestClient.ts:45](https://github.com/clickup/rest-client/blob/master/src/RestClient.ts#L45)

___

### withMiddleware

▸ **withMiddleware**(`middleware`, `method?`): [`RestClient`](RestClient.md)

Returns a new RestClient with added middleware.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `middleware` | [`Middleware`](../interfaces/Middleware.md) | `undefined` |
| `method` | ``"push"`` \| ``"unshift"`` | `"push"` |

#### Returns

[`RestClient`](RestClient.md)

#### Defined in

[src/RestClient.ts:55](https://github.com/clickup/rest-client/blob/master/src/RestClient.ts#L55)

___

### withBase

▸ **withBase**(`base`): [`RestClient`](RestClient.md)

Returns a new RestClient with the base URL which will be prepended to all
relative paths in get(), writeForm() etc. Allows to defer resolution of
this base URL to the very late per-request moment. The complicated piece
here is that, if we want base URL to be resolved asynchronously, we often
times want to reuse the same RestClient object (to e.g. fetch some part of
the base URL using already authenticated client). And a re-enterable call
appears here which we must protect against in the code below.

#### Parameters

| Name | Type |
| :------ | :------ |
| `base` | `string` \| () => `Promise`<`string`\> |

#### Returns

[`RestClient`](RestClient.md)

#### Defined in

[src/RestClient.ts:73](https://github.com/clickup/rest-client/blob/master/src/RestClient.ts#L73)

___

### withHeader

▸ **withHeader**(`name`, `value`): [`RestClient`](RestClient.md)

Returns a new RestClient with a custom header.

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `value` | `string` \| () => `Promise`<`string`\> |

#### Returns

[`RestClient`](RestClient.md)

#### Defined in

[src/RestClient.ts:106](https://github.com/clickup/rest-client/blob/master/src/RestClient.ts#L106)

___

### withBearer

▸ **withBearer**(`token`, `bearerPrefix?`): [`RestClient`](RestClient.md)

Returns a new RestClient with a bearer token authentication workflow.
- RestClient supports interception of options.isTokenInvalid() signal and
  conversion it into RestTokenInvalidError exception.
- If a token() is a lambda with 1 argument, it may be called the 2nd time
  when we get an isTokenInvalid() signal. In this case, the request is
  retried.
- If token() is a lambda with 0 arguments, that means it doesn't want to
  watch for the isTokenInvalid() signal, so there is no sense in retrying
  the request either.

From the first sight, it looks like options.isTokenInvalid() signal is
coupled to setBearer() auth method only. But it's not true:
isTokenInvalid() makes sense for ALL authentication methods actually (even
for basic auth), and setBearer() is just one of "clients" which implements
refreshing/retries on top of isTokenInvalid().

Passing the token as lambda allows the caller to implement some complex
logic, e.g.:
- oauth2 tokens refreshing
- marking the token as "revoked" in the database in case the refresh fails
- marking the token as "revoked" after a failed request if refresh-token is
  not supported

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `token` | [`TokenGetter`](../interfaces/TokenGetter.md)<`string`\> | `undefined` |
| `bearerPrefix` | `string` | `"Bearer "` |

#### Returns

[`RestClient`](RestClient.md)

#### Defined in

[src/RestClient.ts:137](https://github.com/clickup/rest-client/blob/master/src/RestClient.ts#L137)

___

### withOAuth1

▸ **withOAuth1**(`consumer`, `token`): [`RestClient`](RestClient.md)

Returns a new RestClient with oauth1 authentication workflow.
- In case we get an options.isTokenInvalid() signal, the token() lambda is
  called the 2nd time with the error object, then the request is retries.
  This gives the lambda a chance to recover or update something in the
  database.

We use a separate and small oauth-1.0a node library here, because the more
popular one (https://www.npmjs.com/package/oauth) doesn't support signing
of arbitrary requests, it can only send its own requests.

#### Parameters

| Name | Type |
| :------ | :------ |
| `consumer` | `Object` |
| `consumer.consumerKey` | `string` |
| `consumer.consumerSecret` | `string` |
| `token` | [`TokenGetter`](../interfaces/TokenGetter.md)<{ `token`: `string` ; `tokenSecret`: `string`  }\> |

#### Returns

[`RestClient`](RestClient.md)

#### Defined in

[src/RestClient.ts:157](https://github.com/clickup/rest-client/blob/master/src/RestClient.ts#L157)

___

### withBasic

▸ **withBasic**(`token`): [`RestClient`](RestClient.md)

Returns a new RestClient with basic authorization workflow.

#### Parameters

| Name | Type |
| :------ | :------ |
| `token` | [`TokenGetter`](../interfaces/TokenGetter.md)<{ `name`: `string` ; `password`: `string`  }\> |

#### Returns

[`RestClient`](RestClient.md)

#### Defined in

[src/RestClient.ts:193](https://github.com/clickup/rest-client/blob/master/src/RestClient.ts#L193)

___

### get

▸ **get**(`path`, `args?`, `accept?`): [`RestRequest`](RestRequest.md)<`any`\>

Sends a plain GET request without body.

NOTE, all args will be passed through `encodeURIComponent`.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `path` | `string` | `undefined` |
| `args` | `Partial`<`Record`<`string`, `string` \| `number` \| `string`[]\>\> | `{}` |
| `accept` | `string` | `"application/json"` |

#### Returns

[`RestRequest`](RestRequest.md)<`any`\>

#### Defined in

[src/RestClient.ts:211](https://github.com/clickup/rest-client/blob/master/src/RestClient.ts#L211)

___

### writeRaw

▸ **writeRaw**(`path`, `body`, `contentType`, `method?`, `accept?`): [`RestRequest`](RestRequest.md)<`any`\>

Writes some raw string, buffer or a stream.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `path` | `string` | `undefined` |
| `body` | `string` \| `Buffer` \| `ReadableStream` | `undefined` |
| `contentType` | `string` | `undefined` |
| `method` | ``"POST"`` \| ``"PUT"`` \| ``"PATCH"`` | `"POST"` |
| `accept?` | `string` | `undefined` |

#### Returns

[`RestRequest`](RestRequest.md)<`any`\>

#### Defined in

[src/RestClient.ts:222](https://github.com/clickup/rest-client/blob/master/src/RestClient.ts#L222)

___

### writeJson

▸ **writeJson**(`path`, `body`, `method?`, `accept?`): [`RestRequest`](RestRequest.md)<`any`\>

A shortcut method to write JSON body.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `path` | `string` | `undefined` |
| `body` | `any` | `undefined` |
| `method` | ``"POST"`` \| ``"PUT"`` \| ``"PATCH"`` \| ``"DELETE"`` | `"POST"` |
| `accept` | `string` | `"application/json"` |

#### Returns

[`RestRequest`](RestRequest.md)<`any`\>

#### Defined in

[src/RestClient.ts:246](https://github.com/clickup/rest-client/blob/master/src/RestClient.ts#L246)

___

### writeForm

▸ **writeForm**(`path`, `body`, `method?`, `accept?`): [`RestRequest`](RestRequest.md)<`any`\>

A shortcut method to write "application/x-www-form-urlencoded" data.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `path` | `string` | `undefined` |
| `body` | `string` \| `Partial`<`Record`<`string`, `string`\>\> | `undefined` |
| `method` | ``"POST"`` \| ``"PUT"`` \| ``"PATCH"`` | `"POST"` |
| `accept` | `string` | `"application/json"` |

#### Returns

[`RestRequest`](RestRequest.md)<`any`\>

#### Defined in

[src/RestClient.ts:270](https://github.com/clickup/rest-client/blob/master/src/RestClient.ts#L270)

___

### writeDelete

▸ **writeDelete**(`path`, `args?`, `accept?`): [`RestRequest`](RestRequest.md)<`any`\>

A shortcut method to write DELETE request.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `path` | `string` | `undefined` |
| `args` | `Partial`<`Record`<`string`, `string`\>\> | `{}` |
| `accept` | `string` | `"application/json"` |

#### Returns

[`RestRequest`](RestRequest.md)<`any`\>

#### Defined in

[src/RestClient.ts:298](https://github.com/clickup/rest-client/blob/master/src/RestClient.ts#L298)

___

### writeGraphQLX

▸ **writeGraphQLX**(`query`, `variables?`): [`RestRequest`](RestRequest.md)<`any`\>

Returns a RestRequest prepared for sending GraphQL operation.
- Expects the response to contain no errors; throws otherwise.
- In case of success, returns just the content of `data` field (this is
  different with writeGraphQLNullable() which returns `data` as a separate
  fields along with `error` and `errors`).

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `variables` | `any` |

#### Returns

[`RestRequest`](RestRequest.md)<`any`\>

#### Defined in

[src/RestClient.ts:313](https://github.com/clickup/rest-client/blob/master/src/RestClient.ts#L313)

___

### writeGraphQLNullable

▸ **writeGraphQLNullable**(`query`, `variables?`): [`RestRequest`](RestRequest.md)<`undefined` \| ``null`` \| { `data?`: `any` ; `error?`: `any` ; `errors?`: `any`[]  }\>

Same as writeGraphQLX(), but doesn't throw if GraphQL response contains
non-empty `error` or `errors` fields and instead returns the full response.
I.e. allows the caller to process these errors.

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `variables` | `any` |

#### Returns

[`RestRequest`](RestRequest.md)<`undefined` \| ``null`` \| { `data?`: `any` ; `error?`: `any` ; `errors?`: `any`[]  }\>

#### Defined in

[src/RestClient.ts:343](https://github.com/clickup/rest-client/blob/master/src/RestClient.ts#L343)

___

### rangeUpload

▸ **rangeUpload**(`path`, `mimeType`, `stream`, `method?`, `chunkSize`): `Promise`<``null`` \| `string`\>

Performs a series of Content-Range requests with content from a sequence of
Buffers.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `path` | `string` | `undefined` |
| `mimeType` | `string` | `undefined` |
| `stream` | `AsyncIterable`<`Buffer`\> | `undefined` |
| `method` | ``"POST"`` \| ``"PUT"`` | `"POST"` |
| `chunkSize` | `number` | `undefined` |

#### Returns

`Promise`<``null`` \| `string`\>

#### Defined in

[src/RestClient.ts:353](https://github.com/clickup/rest-client/blob/master/src/RestClient.ts#L353)
