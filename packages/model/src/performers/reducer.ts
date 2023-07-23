import type { Draft } from 'immer'

import { OrchModel } from '../orch-model'
import { performer } from './performer'

export type ReducerFactory<P, S> = (state: Draft<S>, payload: P) => Draft<S> | void

export function reducer<P = void, S = unknown>(model: OrchModel<S>, factory: ReducerFactory<P, S>) {
  return performer<P, void>(() => ({
    next(payload) {
      model.state.setState((state) => factory(state, payload))
    },
  }))
}
