[@clickup/rest-client](../README.md) / [Exports](../modules.md) / RestStream

# Class: RestStream

Once created, RestStream must be iterated in full, otherwise the connection
will remain dangling. Also, this class is where we hide the details of the
actual stream reading using AsyncGenerator bridge abstraction.

## Constructors

### constructor

• **new RestStream**(`res`, `readerIterable`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`RestResponse`](RestResponse.md) |
| `readerIterable` | `Object` |
| `readerIterable.[asyncIterator]` | () => `AsyncGenerator`<`string`, `void`, `unknown`\> |

#### Defined in

[src/RestStream.ts:12](https://github.com/clickup/rest-client/blob/master/src/RestStream.ts#L12)

## Properties

### res

• `Readonly` **res**: [`RestResponse`](RestResponse.md)

#### Defined in

[src/RestStream.ts:13](https://github.com/clickup/rest-client/blob/master/src/RestStream.ts#L13)

## Methods

### consumeReturningPrefix

▸ **consumeReturningPrefix**(`maxChars`): `Promise`<`string`\>

Reads the prefix of the stream. Closes the connection after the read is
done in all cases, so safe to be used to e.g. receive a trimmed response.

#### Parameters

| Name | Type |
| :------ | :------ |
| `maxChars` | `number` |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/RestStream.ts:25](https://github.com/clickup/rest-client/blob/master/src/RestStream.ts#L25)

___

### close

▸ **close**(): `Promise`<`void`\>

Closes the connection.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/RestStream.ts:44](https://github.com/clickup/rest-client/blob/master/src/RestStream.ts#L44)

___

### [asyncIterator]

▸ **[asyncIterator]**(): `AsyncGenerator`<`string`, `void`, `unknown`\>

Allows to iterate over the entire stream of data. You must consume the
entire iterable or at least call this.close(), otherwise the connection may
remain open.

#### Returns

`AsyncGenerator`<`string`, `void`, `unknown`\>

#### Defined in

[src/RestStream.ts:66](https://github.com/clickup/rest-client/blob/master/src/RestStream.ts#L66)
