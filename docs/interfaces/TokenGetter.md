[@clickup/rest-client](../README.md) / [Exports](../modules.md) / TokenGetter

# Interface: TokenGetter<TData\>

A callback which returns access token, possibly after refreshing it, and also
possibly before a retry on "invalid token" condition. I.e. it can be called
once or twice (the 2nd time after the previous request error, and that error
will be passed as a parameter).

## Type parameters

| Name | Type |
| :------ | :------ |
| `TData` | `string` |

## Callable

### TokenGetter

▸ **TokenGetter**(`prevError`): `Promise`<`TData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `prevError` | ``null`` \| `Error` |

#### Returns

`Promise`<`TData`\>

#### Defined in

[src/RestClient.ts:21](https://github.com/clickup/rest-client/blob/master/src/RestClient.ts#L21)
