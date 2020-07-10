import produce, { Draft } from 'immer'
import { map, tap } from 'rxjs/operators'

import { OrchModel } from '../orch-model'
import { SetStateSymbol } from '../const'
import { Performer, performer } from './performer'

export type ReducerState<S, D = unknown> = Draft<S> & Readonly<D>

export type ReducerFactory<P, S, D = unknown> = (state: ReducerState<S, D>, payload: P) => S | void

export function reducer<P = void, S = unknown, D = unknown>(
  model: OrchModel<S, D>,
  factory: ReducerFactory<P, S, D>,
): Performer<P> {
  return performer(
    (payload$) =>
      payload$.pipe(
        map((payload) => {
          // `produce` support return `Promise` and `nothing`, but `reducer` don't.
          return produce(model.state.getState(), (state) =>
            factory(state as ReducerState<S, D>, payload),
          ) as S
        }),
        tap((newState) => {
          model.state[SetStateSymbol](newState)
        }),
      ),
    { factoryToLog: factory },
  )
}
