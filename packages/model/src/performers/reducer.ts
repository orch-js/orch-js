import { Draft, produce } from 'immer'
import { map, tap } from 'rxjs/operators'

import { SetStateSymbol } from '../const'
import { OrchModel } from '../orch-model'
import { Performer, performer } from './performer'

export type ReducerState<S, D = unknown> = Draft<S> & Readonly<D>

export type ReducerFactory<P, S, D = unknown> = (
  state: ReducerState<S, D>,
  payload: P,
) => Draft<S> | void

export function reducer<P = void, S = unknown, D = unknown>(
  model: OrchModel<S, D>,
  factory: ReducerFactory<P, S, D>,
): Performer<P> {
  return performer(
    (payload$) =>
      payload$.pipe(
        map((payload): S => {
          return produce<S, Draft<S>>(model.state.getState(), (state) => {
            return factory(state as ReducerState<S, D>, payload)
          })
        }),
        tap((newState) => {
          model.state[SetStateSymbol](newState)
        }),
      ),
    { factoryToLog: factory },
  )
}
