import { Draft, produce } from 'immer'

import { SetStateSymbol } from '../const'
import type { OrchModel } from '../model'

export function mutation<S, P extends any[]>(
  model: OrchModel<S>,
  fn: (draft: Draft<S>, ...params: P) => void,
) {
  return (...params: P) => {
    model[SetStateSymbol](produce((draft) => fn(draft, ...params))(model.getState()))
  }
}
