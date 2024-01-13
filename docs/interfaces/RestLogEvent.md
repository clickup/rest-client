[@clickup/rest-client](../README.md) / [Exports](../modules.md) / RestLogEvent

# Interface: RestLogEvent

An event which is passed to an external logger (see RestOptions).

## Properties

### attempt

• **attempt**: `number`

#### Defined in

[src/RestOptions.ts:12](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L12)

___

### req

• **req**: [`RestRequest`](../classes/RestRequest.md)\<`any`\>

#### Defined in

[src/RestOptions.ts:13](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L13)

___

### res

• **res**: ``null`` \| [`RestResponse`](../classes/RestResponse.md) \| ``"backoff_delay"``

#### Defined in

[src/RestOptions.ts:14](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L14)

___

### exception

• **exception**: `any`

#### Defined in

[src/RestOptions.ts:15](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L15)

___

### timestamp

• **timestamp**: `number`

#### Defined in

[src/RestOptions.ts:16](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L16)

___

### elapsed

• **elapsed**: `number`

#### Defined in

[src/RestOptions.ts:17](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L17)

___

### isFinalAttempt

• **isFinalAttempt**: `boolean`

#### Defined in

[src/RestOptions.ts:18](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L18)

___

### privateDataInResponse

• **privateDataInResponse**: `boolean`

#### Defined in

[src/RestOptions.ts:19](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L19)

___

### comment

• **comment**: `string`

#### Defined in

[src/RestOptions.ts:20](https://github.com/clickup/rest-client/blob/master/src/RestOptions.ts#L20)
