[@clickup/rest-client](../README.md) / [Exports](../modules.md) / Pacer

# Interface: Pacer

Pacer is a class which allows to pace requests on some resource identified by
the instance of this class.

## Properties

### key

• `Readonly` **key**: `string`

Human readable name of the pacer, used when composing multiple pacers.

#### Defined in

[src/middlewares/paceRequests.ts:12](https://github.com/clickup/rest-client/blob/master/src/middlewares/paceRequests.ts#L12)

## Methods

### pace

▸ **pace**(): `Promise`\<[`PacerOutcome`](PacerOutcome.md)\>

Signals that we're about to send a request. Returns the delay we need to
wait for before actually sending.

#### Returns

`Promise`\<[`PacerOutcome`](PacerOutcome.md)\>

#### Defined in

[src/middlewares/paceRequests.ts:18](https://github.com/clickup/rest-client/blob/master/src/middlewares/paceRequests.ts#L18)
