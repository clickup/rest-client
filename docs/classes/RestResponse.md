[@clickup/rest-client](../README.md) / [Exports](../modules.md) / RestResponse

# Class: RestResponse

RestResponse is intentionally not aware of the data structure it carries, and
it doesn't do any assertions/validations which is the responsibility of
RestRequest helper methods.

We also use a concept of "body preloading". Sometimes, e.g. on non-successful
HTTP status codes, we also need to know the body content (at least its
beginning), do double check whether should we retry, throw through or through
a user-friendly error. To do this, we need to preload the beginning of the
body and make it a part of RestResponse abstraction.

## Constructors

### constructor

• **new RestResponse**(`req`, `agent`, `status`, `headers`, `text`, `textIsPartial`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `req` | [`RestRequest`](RestRequest.md)<`any`\> |
| `agent` | ``null`` \| `Agent` |
| `status` | `number` |
| `headers` | `Headers` |
| `text` | `string` |
| `textIsPartial` | `boolean` |

#### Defined in

[src/RestResponse.ts:18](https://github.com/clickup/rest-client/blob/master/src/RestResponse.ts#L18)

## Properties

### req

• `Readonly` **req**: [`RestRequest`](RestRequest.md)<`any`\>

#### Defined in

[src/RestResponse.ts:19](https://github.com/clickup/rest-client/blob/master/src/RestResponse.ts#L19)

___

### agent

• `Readonly` **agent**: ``null`` \| `Agent`

#### Defined in

[src/RestResponse.ts:20](https://github.com/clickup/rest-client/blob/master/src/RestResponse.ts#L20)

___

### status

• `Readonly` **status**: `number`

#### Defined in

[src/RestResponse.ts:21](https://github.com/clickup/rest-client/blob/master/src/RestResponse.ts#L21)

___

### headers

• `Readonly` **headers**: `Headers`

#### Defined in

[src/RestResponse.ts:22](https://github.com/clickup/rest-client/blob/master/src/RestResponse.ts#L22)

___

### text

• `Readonly` **text**: `string`

#### Defined in

[src/RestResponse.ts:23](https://github.com/clickup/rest-client/blob/master/src/RestResponse.ts#L23)

___

### textIsPartial

• `Readonly` **textIsPartial**: `boolean`

#### Defined in

[src/RestResponse.ts:24](https://github.com/clickup/rest-client/blob/master/src/RestResponse.ts#L24)

## Accessors

### json

• `get` **json**(): `undefined` \| ``null`` \| `string` \| `number` \| `boolean` \| `object`

A safe way to treat the response as JSON.
- Never throws, i.e. we imply that the caller will verify the structure of
  the response and do its own errors processing.
- It's a getter, so we can use typescript-is'es is<xyz>() type guard, e.g.:
  `if (is<{ errors: any[] }>(res.json) && res.json.errors.length) { ... }`

Notice that there is NO `assert()` abstraction inside RestResponse class.
This is because RestClient sometimes substitutes the response with some
sub-field (e.g. see writeGraphQLX() method), and we still need to run the
assertion in such cases. By not having strong typing here, we intentionally
make the use of this method harder, so people will prefer using
RestRequest.json() instead.

#### Returns

`undefined` \| ``null`` \| `string` \| `number` \| `boolean` \| `object`

#### Defined in

[src/RestResponse.ts:42](https://github.com/clickup/rest-client/blob/master/src/RestResponse.ts#L42)
