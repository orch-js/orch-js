import produce, { Draft } from 'immer'
import { map, tap } from 'rxjs/operators'

import { OrchState } from '../orch-state'
import { Performer, performer } from './performer'

export type ReducerFactory<P, S> = (state: Draft<S>, payload: P) => S | void

export function reducer<P = void, S = unknown>(
  model: { state: OrchState<S> },
  factory: ReducerFactory<P, S>,
): Performer<P> {
  return performer(
    (payload$) =>
      payload$.pipe(
        map((payload) => {
          // `produce` support return `Promise` and `nothing`, but `reducer` don't.
          return produce(model.state.getState(), (state) => factory(state, payload)) as S
        }),
        tap((newState) => {
          model.state.setState(newState)
        }),
      ),
    { factoryToLog: factory },
  )
}
