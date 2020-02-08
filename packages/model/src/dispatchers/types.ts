import { Observable } from 'rxjs'
import { Draft } from 'immer'

import { ActionSymbol } from './symbols'

export type Action = {
  (): void
  identify: typeof ActionSymbol
}

export type Dispatcher<P> = {
  (payload: P): void
  asAction: (payload: P) => Action
}

export type EffectFunc<P> = (payload$: Observable<P>) => Observable<Action>

export type ReducerFunc<S, P> = (state: Draft<S>, payload: P) => S | void
