import { OmitProperties } from 'ts-essentials'

// https://stackoverflow.com/questions/55541275/typescript-check-for-the-any-type
export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N

export type IsAny<T> = IfAny<T, true, false>

export type IsEmptyPayload<P> = P extends void
  ? true
  : IsAny<P> extends true
  ? false
  : unknown extends P
  ? true
  : false

export type PayloadFunc<Payload, ReturnType> = IsEmptyPayload<Payload> extends true
  ? () => ReturnType
  : (payload: Payload) => ReturnType

export type OmitNeverProperties<T> = OmitProperties<T, never>
