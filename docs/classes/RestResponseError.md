[@clickup/rest-client](../README.md) / [Exports](../modules.md) / RestResponseError

# Class: RestResponseError

## Hierarchy

- [`RestError`](RestError.md)

  ↳ **`RestResponseError`**

  ↳↳ [`RestContentSizeOverLimitError`](RestContentSizeOverLimitError.md)

  ↳↳ [`RestRateLimitError`](RestRateLimitError.md)

  ↳↳ [`RestRetriableError`](RestRetriableError.md)

  ↳↳ [`RestTimeoutError`](RestTimeoutError.md)

  ↳↳ [`RestTokenInvalidError`](RestTokenInvalidError.md)

## Constructors

### constructor

• **new RestResponseError**(`message`, `res`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `res` | [`RestResponse`](RestResponse.md) |

#### Overrides

[RestError](RestError.md).[constructor](RestError.md#constructor)

#### Defined in

[src/errors/RestResponseError.ts:19](https://github.com/clickup/rest-client/blob/master/src/errors/RestResponseError.ts#L19)

## Properties

### res

• `Readonly` **res**: [`RestResponse`](RestResponse.md)

#### Defined in

[src/errors/RestResponseError.ts:10](https://github.com/clickup/rest-client/blob/master/src/errors/RestResponseError.ts#L10)

___

### method

• `Readonly` **method**: `string`

#### Defined in

[src/errors/RestResponseError.ts:12](https://github.com/clickup/rest-client/blob/master/src/errors/RestResponseError.ts#L12)

___

### host

• `Readonly` **host**: `string`

#### Defined in

[src/errors/RestResponseError.ts:13](https://github.com/clickup/rest-client/blob/master/src/errors/RestResponseError.ts#L13)

___

### pathname

• `Readonly` **pathname**: `string`

#### Defined in

[src/errors/RestResponseError.ts:14](https://github.com/clickup/rest-client/blob/master/src/errors/RestResponseError.ts#L14)

___

### requestArgs

• `Readonly` **requestArgs**: `string`

#### Defined in

[src/errors/RestResponseError.ts:15](https://github.com/clickup/rest-client/blob/master/src/errors/RestResponseError.ts#L15)

___

### requestBody

• `Readonly` **requestBody**: `string`

#### Defined in

[src/errors/RestResponseError.ts:16](https://github.com/clickup/rest-client/blob/master/src/errors/RestResponseError.ts#L16)

___

### responseHeaders

• `Readonly` **responseHeaders**: `string`

#### Defined in

[src/errors/RestResponseError.ts:17](https://github.com/clickup/rest-client/blob/master/src/errors/RestResponseError.ts#L17)
