[@clickup/rest-client](../README.md) / [Exports](../modules.md) / RestRequest

# Class: RestRequest\<TAssertShape\>

Type TAssertShape allows to limit json()'s assert callbacks to only those
which return an object compatible with TAssertShape.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TAssertShape` | `any` |

## Constructors

### constructor

• **new RestRequest**\<`TAssertShape`\>(`options`, `method`, `url`, `headers`, `body`, `shape?`): [`RestRequest`](RestRequest.md)\<`TAssertShape`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TAssertShape` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`RestOptions`](../interfaces/RestOptions.md) |
| `method` | ``"GET"`` \| ``"POST"`` \| ``"PUT"`` \| ``"PATCH"`` \| ``"DELETE"`` |
| `url` | `string` |
| `headers` | `Headers` |
| `body` | `string` \| `Buffer` \| `ReadableStream` |
| `shape?` | `string` |

#### Returns

[`RestRequest`](RestRequest.md)\<`TAssertShape`\>

#### Defined in

[src/RestRequest.ts:30](https://github.com/clickup/rest-client/blob/master/src/RestRequest.ts#L30)

## Properties

### options

• `Readonly` **options**: [`RestOptions`](../interfaces/RestOptions.md)

#### Defined in

[src/RestRequest.ts:28](https://github.com/clickup/rest-client/blob/master/src/RestRequest.ts#L28)

___

### method

• `Readonly` **method**: ``"GET"`` \| ``"POST"`` \| ``"PUT"`` \| ``"PATCH"`` \| ``"DELETE"``

#### Defined in

[src/RestRequest.ts:32](https://github.com/clickup/rest-client/blob/master/src/RestRequest.ts#L32)

___

### url

• **url**: `string`

#### Defined in

[src/RestRequest.ts:33](https://github.com/clickup/rest-client/blob/master/src/RestRequest.ts#L33)

___

### headers

• `Readonly` **headers**: `Headers`

#### Defined in

[src/RestRequest.ts:34](https://github.com/clickup/rest-client/blob/master/src/RestRequest.ts#L34)

___

### body

• `Readonly` **body**: `string` \| `Buffer` \| `ReadableStream`

#### Defined in

[src/RestRequest.ts:35](https://github.com/clickup/rest-client/blob/master/src/RestRequest.ts#L35)

___

### shape

• `Optional` `Readonly` **shape**: `string`

#### Defined in

[src/RestRequest.ts:36](https://github.com/clickup/rest-client/blob/master/src/RestRequest.ts#L36)

## Methods

### setHeader

▸ **setHeader**(`name`, `value`): [`RestRequest`](RestRequest.md)\<`TAssertShape`\>

Modifies the request by adding a custom HTTP header.

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `value` | `string` |

#### Returns

[`RestRequest`](RestRequest.md)\<`TAssertShape`\>

#### Defined in

[src/RestRequest.ts:44](https://github.com/clickup/rest-client/blob/master/src/RestRequest.ts#L44)

___

### setOptions

▸ **setOptions**(`options`): [`RestRequest`](RestRequest.md)\<`TAssertShape`\>

Modifies the request by adding a custom request option.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Partial`\<[`RestOptions`](../interfaces/RestOptions.md)\> |

#### Returns

[`RestRequest`](RestRequest.md)\<`TAssertShape`\>

#### Defined in

[src/RestRequest.ts:52](https://github.com/clickup/rest-client/blob/master/src/RestRequest.ts#L52)

___

### setDebug

▸ **setDebug**(`flag?`): [`RestRequest`](RestRequest.md)\<`TAssertShape`\>

Forces RestClient to debug-output the request and response to console.
Never use in production.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `flag` | `boolean` | `true` |

#### Returns

[`RestRequest`](RestRequest.md)\<`TAssertShape`\>

#### Defined in

[src/RestRequest.ts:64](https://github.com/clickup/rest-client/blob/master/src/RestRequest.ts#L64)

___

### json

▸ **json**\<`TJson`\>(`assert`, `...checkers`): `Promise`\<`TJson`\>

Sends the request and reads the response a JSON. In absolute most of the
cases, this method is used to reach API responses. The assert callback
(typically generated by typescript-is) is intentionally made mandatory to
not let people to do anti-patterns.

#### Type parameters

| Name |
| :------ |
| `TJson` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `assert` | \{ `mask`: (`obj`: `any`) => `TJson`  } \| \{ `$assert`: (`obj`: `any`) => `TJson`  } \| (`obj`: `any`) => `TJson` |
| `...checkers` | (`json`: `TJson`, `res`: [`RestResponse`](RestResponse.md)) => ``false`` \| `Error`[] |

#### Returns

`Promise`\<`TJson`\>

#### Defined in

[src/RestRequest.ts:75](https://github.com/clickup/rest-client/blob/master/src/RestRequest.ts#L75)

___

### text

▸ **text**(): `Promise`\<`string`\>

Sends the request and returns plaintext response.

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/RestRequest.ts:107](https://github.com/clickup/rest-client/blob/master/src/RestRequest.ts#L107)

___

### response

▸ **response**(): `Promise`\<[`RestResponse`](RestResponse.md)\>

Returns the entire RestResponse object with response status and headers
information in it. Try to minimize usage of this method, because it doesn't
make any assumptions on the response structure.

#### Returns

`Promise`\<[`RestResponse`](RestResponse.md)\>

#### Defined in

[src/RestRequest.ts:118](https://github.com/clickup/rest-client/blob/master/src/RestRequest.ts#L118)

___

### stream

▸ **stream**(`preloadChars?`): `Promise`\<[`RestStream`](RestStream.md)\>

Sends the requests and returns RestStream object. You MUST iterate over
this object entirely (or call its return() method), otherwise the
connection will remain dangling.

#### Parameters

| Name | Type |
| :------ | :------ |
| `preloadChars` | `number` |

#### Returns

`Promise`\<[`RestStream`](RestStream.md)\>

#### Defined in

[src/RestRequest.ts:134](https://github.com/clickup/rest-client/blob/master/src/RestRequest.ts#L134)
