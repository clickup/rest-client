[@clickup/rest-client](../README.md) / [Exports](../modules.md) / Middleware

# Interface: Middleware

Middlewares allow to modify RestRequest and RestResponse objects during the
request processing.

## Callable

### Middleware

▸ **Middleware**(`req`, `next`): `Promise`<[`RestResponse`](../classes/RestResponse.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `req` | [`RestRequest`](../classes/RestRequest.md)<`any`\> |
| `next` | (`req`: [`RestRequest`](../classes/RestRequest.md)<`any`\>) => `Promise`<[`RestResponse`](../classes/RestResponse.md)\> |

#### Returns

`Promise`<[`RestResponse`](../classes/RestResponse.md)\>

#### Defined in

[src/RestOptions.ts:28](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L28)
