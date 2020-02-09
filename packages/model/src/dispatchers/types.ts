import { Observable } from 'rxjs'
import { Draft } from 'immer'

import { ActionSymbol } from './symbols'

// https://stackoverflow.com/questions/55541275/typescript-check-for-the-any-type
type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N

type IsAny<T> = IfAny<T, true, false>

type IsEmptyPayload<P> = P extends void
  ? true
  : IsAny<P> extends true
  ? false
  : unknown extends P
  ? true
  : false

export type Action = {
  (): void
  identify: typeof ActionSymbol
}

export type Dispatcher<P> = IsEmptyPayload<P> extends true
  ? {
      (): void
      asAction: () => Action
    }
  : {
      (payload: P): void
      asAction: (payload: P) => Action
    }

export type EffectFunc<P> = (payload$: Observable<P>) => Observable<Action>

export type ReducerFunc<S, P> = (state: Draft<S>, payload: P) => S | void
