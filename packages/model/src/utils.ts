import { Model } from './model'

export function getModelState<S>(model: Model<S>): S | null {
  let state: S | null = null

  model.state$
    .subscribe((currentState) => {
      state = currentState
    })
    .unsubscribe()

  return state
}
