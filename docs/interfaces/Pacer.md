[@clickup/rest-client](../README.md) / [Exports](../modules.md) / Pacer

# Interface: Pacer

Pacer is a class which allows to pace requests on some resource identified by
the instance of this class.

## Implemented by

- [`PacerComposite`](../classes/PacerComposite.md)
- [`PacerQPS`](../classes/PacerQPS.md)

## Properties

### name

• `Readonly` **name**: `string`

Human readable name of the pacer, used when composing multiple pacers.

#### Defined in

[src/pacers/Pacer.ts:15](https://github.com/clickup/rest-client/blob/master/src/pacers/Pacer.ts#L15)

## Methods

### touch

▸ **touch**(): `Promise`\<[`PacerDelay`](PacerDelay.md)\>

Signals that we're about to send a request. Returns the delay we need to
wait for before actually sending.

#### Returns

`Promise`\<[`PacerDelay`](PacerDelay.md)\>

#### Defined in

[src/pacers/Pacer.ts:21](https://github.com/clickup/rest-client/blob/master/src/pacers/Pacer.ts#L21)
