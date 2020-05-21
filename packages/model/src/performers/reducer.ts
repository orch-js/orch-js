import produce, { Draft } from 'immer'
import { map, tap } from 'rxjs/operators'

import { Performer, performer } from './performer'

export type ReducerFactoryParam<P, S> = { state: Draft<S>; payload: P }

export type ReducerFactory<P, S> = (param: ReducerFactoryParam<P, S>) => S | void

export function reducer<P = void, S = unknown>(factory: ReducerFactory<P, S>): Performer<P, S> {
  return performer(({ payload$, orchState }) =>
    payload$.pipe(
      map((payload) => {
        // `produce` support return `Promise` and `nothing`, but `reducer` don't.
        return produce(orchState.getState(), (state) => factory({ state, payload })) as S
      }),
      tap((newState) => {
        orchState.setState(newState)
      }),
    ),
  )
}
