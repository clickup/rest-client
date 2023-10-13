[@clickup/rest-client](../README.md) / [Exports](../modules.md) / PacerQPSOptions

# Interface: PacerQPSOptions

## Properties

### qps

• **qps**: `number`

The maximum QPS allowed within the rolling window.

#### Defined in

[src/pacers/PacerQPS.ts:51](https://github.com/clickup/rest-client/blob/master/src/pacers/PacerQPS.ts#L51)

___

### windowSec

• `Optional` **windowSec**: `number`

The length of the rolling windows in milliseconds.

#### Defined in

[src/pacers/PacerQPS.ts:53](https://github.com/clickup/rest-client/blob/master/src/pacers/PacerQPS.ts#L53)

___

### decreaseThreshold

• `Optional` **decreaseThreshold**: `number`

Decrease the delay if the number of requests in the window has dropped
below `decreaseThreshold` portion of the limit.

#### Defined in

[src/pacers/PacerQPS.ts:56](https://github.com/clickup/rest-client/blob/master/src/pacers/PacerQPS.ts#L56)
