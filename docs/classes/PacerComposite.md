[@clickup/rest-client](../README.md) / [Exports](../modules.md) / PacerComposite

# Class: PacerComposite

A Pacer which runs all sub-pacers and chooses the largest delay.

## Implements

- [`Pacer`](../interfaces/Pacer.md)

## Constructors

### constructor

• **new PacerComposite**(`_pacers`): [`PacerComposite`](PacerComposite.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_pacers` | [`Pacer`](../interfaces/Pacer.md)[] |

#### Returns

[`PacerComposite`](PacerComposite.md)

#### Defined in

[src/pacers/PacerComposite.ts:10](https://github.com/clickup/rest-client/blob/master/src/pacers/PacerComposite.ts#L10)

## Properties

### name

• `Readonly` **name**: ``""``

Human readable name of the pacer, used when composing multiple pacers.

#### Implementation of

[Pacer](../interfaces/Pacer.md).[name](../interfaces/Pacer.md#name)

#### Defined in

[src/pacers/PacerComposite.ts:8](https://github.com/clickup/rest-client/blob/master/src/pacers/PacerComposite.ts#L8)

## Methods

### touch

▸ **touch**(): `Promise`\<\{ `delayMs`: `number` ; `reason`: `string`  }\>

Signals that we're about to send a request. Returns the delay we need to
wait for before actually sending.

#### Returns

`Promise`\<\{ `delayMs`: `number` ; `reason`: `string`  }\>

#### Implementation of

[Pacer](../interfaces/Pacer.md).[touch](../interfaces/Pacer.md#touch)

#### Defined in

[src/pacers/PacerComposite.ts:12](https://github.com/clickup/rest-client/blob/master/src/pacers/PacerComposite.ts#L12)
