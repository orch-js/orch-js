import { Draft, produce } from 'immer'

import { SetStateSymbol } from '../const'
import { OrchModel } from '../orch-model'
import { performer } from './performer'

export type ReducerState<S, D = unknown> = Draft<S> & Readonly<D>

export type ReducerFactory<P, S, D = unknown> = (
  state: ReducerState<S, D>,
  payload: P,
) => Draft<S> | void

export function reducer<P = void, S = unknown, D = unknown>(
  model: OrchModel<S, D>,
  factory: ReducerFactory<P, S, D>,
) {
  return performer<P, void>(() => ({
    next(payload) {
      const newState = produce<S, Draft<S>>(model.state.getState(), (state) =>
        factory(state as ReducerState<S, D>, payload),
      )

      model.state[SetStateSymbol](newState)
    },
  }))
}
