[@clickup/rest-client](README.md) / Exports

# @clickup/rest-client

## Classes

- [RestClient](classes/RestClient.md)
- [RestRequest](classes/RestRequest.md)
- [RestResponse](classes/RestResponse.md)
- [RestStream](classes/RestStream.md)
- [RestContentSizeOverLimitError](classes/RestContentSizeOverLimitError.md)
- [RestError](classes/RestError.md)
- [RestRateLimitError](classes/RestRateLimitError.md)
- [RestResponseError](classes/RestResponseError.md)
- [RestRetriableError](classes/RestRetriableError.md)
- [RestTimeoutError](classes/RestTimeoutError.md)
- [RestTokenInvalidError](classes/RestTokenInvalidError.md)

## Interfaces

- [TokenGetter](interfaces/TokenGetter.md)
- [RestLogEvent](interfaces/RestLogEvent.md)
- [Middleware](interfaces/Middleware.md)
- [RestOptions](interfaces/RestOptions.md)
- [Pacer](interfaces/Pacer.md)
- [PacerOutcome](interfaces/PacerOutcome.md)

## Functions

### depaginate

▸ **depaginate**\<`TItem`, `TCursor`\>(`readFunc`): `AsyncGenerator`\<`TItem`, `void`, `undefined`\>

Keeps calling a function with an updating cursor, and depaginates all the
results until the cursor returned is null or undefined.

On each call, the inner function needs to return an array with two elements:
1. Array or results, which could be empty, but not null or undefined.
2. A new cursor.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TItem` | `TItem` |
| `TCursor` | `string` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `readFunc` | (`cursor`: `undefined` \| `TCursor`) => `Promise`\<readonly [`TItem`[], `undefined` \| ``null`` \| `TCursor`]\> |

#### Returns

`AsyncGenerator`\<`TItem`, `void`, `undefined`\>

#### Defined in

[src/helpers/depaginate.ts:9](https://github.com/clickup/rest-client/blob/master/src/helpers/depaginate.ts#L9)

___

### paceRequests

▸ **paceRequests**(`pacer`, `delayMetric?`): [`Middleware`](interfaces/Middleware.md)

Rest Client middleware that adds some delay between requests using one of
Pacer implementations.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pacer` | ``null`` \| [`Pacer`](interfaces/Pacer.md) \| (`req`: [`RestRequest`](classes/RestRequest.md)\<`any`\>) => `Promise`\<``null`` \| [`Pacer`](interfaces/Pacer.md)\> |
| `delayMetric?` | (`delay`: `number`, `reason`: `string`) => `void` |

#### Returns

[`Middleware`](interfaces/Middleware.md)

#### Defined in

[src/middlewares/paceRequests.ts:33](https://github.com/clickup/rest-client/blob/master/src/middlewares/paceRequests.ts#L33)
