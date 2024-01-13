[@clickup/rest-client](../README.md) / [Exports](../modules.md) / PacerQPSBackend

# Interface: PacerQPSBackend

## Properties

### key

• `Readonly` **key**: `string`

Resource key which this backend is operating on.

#### Defined in

[src/pacers/PacerQPS.ts:33](https://github.com/clickup/rest-client/blob/master/src/pacers/PacerQPS.ts#L33)

## Methods

### push

▸ **push**(`props`): `Promise`\<\{ `count`: `number` ; `sum`: `number` ; `avg`: `number` ; `median`: `number`  }\>

Maintains the array of numbers somewhere in memory (time-value pairs),
inserts a new time-value pair to the end of this list, and removes all the
entries which are earlier than `minTime`. Returns the size of the resulting
array and some central tendency statistics about its values.

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `Object` |
| `props.time` | `number` |
| `props.minTime` | `number` |
| `props.value` | `number` |
| `props.minCountForCentralTendency` | `number` |

#### Returns

`Promise`\<\{ `count`: `number` ; `sum`: `number` ; `avg`: `number` ; `median`: `number`  }\>

#### Defined in

[src/pacers/PacerQPS.ts:41](https://github.com/clickup/rest-client/blob/master/src/pacers/PacerQPS.ts#L41)
