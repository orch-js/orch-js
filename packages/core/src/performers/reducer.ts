import type { Draft } from 'immer'

import { setState } from '../internal-actions'
import { OrchModel } from '../model'
import { performer } from './performer'

export type ReducerFactory<P, S> = (state: Draft<S>, payload: P) => Draft<S> | void

export function reducer<P = void, S = unknown>(model: OrchModel<S>, factory: ReducerFactory<P, S>) {
  return performer<P, void>(() => ({
    next(payload) {
      setState(model, (state) => factory(state, payload))
    },
  }))
}
