import { Draft, produce } from 'immer'

import { SetStateSymbol } from '../const'
import type { OrchModel, OrchModelState } from '../model'

export type MutationFn<State, P extends any[]> = (draft: Draft<State>, ...params: P) => void

export function mutation<T extends OrchModel<any>, P extends any[]>(
  model: T,
  fn: MutationFn<OrchModelState<T>, P>,
) {
  return (...params: P) => {
    model[SetStateSymbol](produce((draft) => fn(draft, ...params))(model.getState()))
  }
}
