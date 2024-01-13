[@clickup/rest-client](../README.md) / [Exports](../modules.md) / PacerQPS

# Class: PacerQPS

Implements a very simple heuristic:
- increase the delay if we're above the QPS within the rolling window;
- decrease the delay if we're below the desired QPS.

Each worker keeps (and grows/shrinks) its delay individually; this way, we
don't need to elect, who's the "source of truth" for the delay.

Backend is a concrete (and minimal) implementation of the storage logic for
the pacing algorithm.

## Implements

- [`Pacer`](../interfaces/Pacer.md)

## Constructors

### constructor

• **new PacerQPS**(`_options`, `_backend`): [`PacerQPS`](PacerQPS.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_options` | [`PacerQPSOptions`](../interfaces/PacerQPSOptions.md) |
| `_backend` | [`PacerQPSBackend`](../interfaces/PacerQPSBackend.md) |

#### Returns

[`PacerQPS`](PacerQPS.md)

#### Defined in

[src/pacers/PacerQPS.ts:74](https://github.com/clickup/rest-client/blob/master/src/pacers/PacerQPS.ts#L74)

## Accessors

### name

• `get` **name**(): `string`

Human readable name of the pacer, used when composing multiple pacers.

#### Returns

`string`

#### Implementation of

[Pacer](../interfaces/Pacer.md).[name](../interfaces/Pacer.md#name)

#### Defined in

[src/pacers/PacerQPS.ts:79](https://github.com/clickup/rest-client/blob/master/src/pacers/PacerQPS.ts#L79)

## Methods

### touch

▸ **touch**(): `Promise`\<[`PacerDelay`](../interfaces/PacerDelay.md)\>

Signals that we're about to send a request. Returns the delay we need to
wait for before actually sending.

#### Returns

`Promise`\<[`PacerDelay`](../interfaces/PacerDelay.md)\>

#### Implementation of

[Pacer](../interfaces/Pacer.md).[touch](../interfaces/Pacer.md#touch)

#### Defined in

[src/pacers/PacerQPS.ts:83](https://github.com/clickup/rest-client/blob/master/src/pacers/PacerQPS.ts#L83)
