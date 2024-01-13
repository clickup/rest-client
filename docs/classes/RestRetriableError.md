[@clickup/rest-client](../README.md) / [Exports](../modules.md) / RestRetriableError

# Class: RestRetriableError

## Hierarchy

- [`RestResponseError`](RestResponseError.md)

  ↳ **`RestRetriableError`**

## Constructors

### constructor

• **new RestRetriableError**(`message`, `delayMs`, `res`): [`RestRetriableError`](RestRetriableError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `delayMs` | `number` |
| `res` | [`RestResponse`](RestResponse.md) |

#### Returns

[`RestRetriableError`](RestRetriableError.md)

#### Overrides

[RestResponseError](RestResponseError.md).[constructor](RestResponseError.md#constructor)

#### Defined in

[src/errors/RestRetriableError.ts:5](https://github.com/clickup/rest-client/blob/master/src/errors/RestRetriableError.ts#L5)

## Properties

### res

• `Readonly` **res**: [`RestResponse`](RestResponse.md)

#### Inherited from

[RestResponseError](RestResponseError.md).[res](RestResponseError.md#res)

#### Defined in

[src/errors/RestResponseError.ts:10](https://github.com/clickup/rest-client/blob/master/src/errors/RestResponseError.ts#L10)

___

### method

• `Readonly` **method**: `string`

#### Inherited from

[RestResponseError](RestResponseError.md).[method](RestResponseError.md#method)

#### Defined in

[src/errors/RestResponseError.ts:12](https://github.com/clickup/rest-client/blob/master/src/errors/RestResponseError.ts#L12)

___

### host

• `Readonly` **host**: `string`

#### Inherited from

[RestResponseError](RestResponseError.md).[host](RestResponseError.md#host)

#### Defined in

[src/errors/RestResponseError.ts:13](https://github.com/clickup/rest-client/blob/master/src/errors/RestResponseError.ts#L13)

___

### pathname

• `Readonly` **pathname**: `string`

#### Inherited from

[RestResponseError](RestResponseError.md).[pathname](RestResponseError.md#pathname)

#### Defined in

[src/errors/RestResponseError.ts:14](https://github.com/clickup/rest-client/blob/master/src/errors/RestResponseError.ts#L14)

___

### requestArgs

• `Readonly` **requestArgs**: `string`

#### Inherited from

[RestResponseError](RestResponseError.md).[requestArgs](RestResponseError.md#requestargs)

#### Defined in

[src/errors/RestResponseError.ts:15](https://github.com/clickup/rest-client/blob/master/src/errors/RestResponseError.ts#L15)

___

### requestBody

• `Readonly` **requestBody**: `string`

#### Inherited from

[RestResponseError](RestResponseError.md).[requestBody](RestResponseError.md#requestbody)

#### Defined in

[src/errors/RestResponseError.ts:16](https://github.com/clickup/rest-client/blob/master/src/errors/RestResponseError.ts#L16)

___

### responseHeaders

• `Readonly` **responseHeaders**: `string`

#### Inherited from

[RestResponseError](RestResponseError.md).[responseHeaders](RestResponseError.md#responseheaders)

#### Defined in

[src/errors/RestResponseError.ts:17](https://github.com/clickup/rest-client/blob/master/src/errors/RestResponseError.ts#L17)

___

### delayMs

• **delayMs**: `number`

#### Defined in

[src/errors/RestRetriableError.ts:7](https://github.com/clickup/rest-client/blob/master/src/errors/RestRetriableError.ts#L7)
