import { SetStateSymbol } from '../const'
import type { OrchModel } from '../model'

export function reducer<S, P extends any[]>(
  model: OrchModel<S>,
  fn: (state: Readonly<S>, ...params: P) => S,
) {
  return (...params: P) => {
    const currentState = model.getState()
    const newState = fn(currentState, ...params)

    if (newState !== currentState) {
      model[SetStateSymbol](newState)
    }
  }
}
