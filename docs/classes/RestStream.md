[@clickup/rest-client](../README.md) / [Exports](../modules.md) / RestStream

# Class: RestStream

Once created, RestStream must be iterated in full, otherwise the connection
will remain dangling. Also, this class is where we hide the details of the
actual stream reading using AsyncGenerator bridge abstraction.

RestStream can also read binary data depending on the Content-Type response
header and/or the charset provided there. The binary data is still returned
as a string, one string character per each byte. To convert it to a Buffer,
use something like `Buffer.from(responseText, "binary")`.

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

[src/RestStream.ts:17](https://github.com/clickup/rest-client/blob/master/src/RestStream.ts#L17)

## Properties

### res

• `Readonly` **res**: [`RestResponse`](RestResponse.md)

#### Defined in

[src/RestStream.ts:18](https://github.com/clickup/rest-client/blob/master/src/RestStream.ts#L18)

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

[src/RestStream.ts:30](https://github.com/clickup/rest-client/blob/master/src/RestStream.ts#L30)

___

### close

▸ **close**(): `Promise`<`void`\>

Closes the connection.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/RestStream.ts:49](https://github.com/clickup/rest-client/blob/master/src/RestStream.ts#L49)

___

### [asyncIterator]

▸ **[asyncIterator]**(): `AsyncGenerator`<`string`, `void`, `unknown`\>

Allows to iterate over the entire stream of data. You must consume the
entire iterable or at least call this.close(), otherwise the connection may
remain open.

#### Returns

`AsyncGenerator`<`string`, `void`, `unknown`\>

#### Defined in

[src/RestStream.ts:71](https://github.com/clickup/rest-client/blob/master/src/RestStream.ts#L71)
