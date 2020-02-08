import { Observable } from 'rxjs'
import { Draft } from 'immer'

export type Action = () => void

export type Dispatcher<P> = {
  (payload: P): void
  asAction: (payload: P) => Action
}

export type ReducerFunc<S, P> = (state: Draft<S>, payload: P) => S | void

export type EffectFunc<P> = (payload$: Observable<P>) => Observable<Action>
