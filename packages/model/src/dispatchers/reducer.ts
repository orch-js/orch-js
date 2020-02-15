import produce from 'immer'

import { Model } from '../model'
import { StateSourceSymbol } from '../symbols'
import { getModelState } from '../utils'
import { ReducerFunc, Dispatcher } from './types'
import { dispatcherFactory } from './utils'

export function reducer<S>(model: Model<S>) {
  return <P>(reducerFunc: ReducerFunc<S, P>): Dispatcher<P> => {
    return dispatcherFactory((payload: P) => {
      const currentState = getModelState(model)

      if (currentState) {
        // `produce` support return `Promise` and `nothing`, but `reducer` don't.
        const newState = produce(currentState, (state) => reducerFunc(state, payload)) as S
        model[StateSourceSymbol].next(newState)
      }
    })
  }
}
