import produce from 'immer'

import { Model } from '../model'
import { StateSourceSymbol } from '../symbols'
import { ReducerFunc, Dispatcher } from './types'
import { dispatcherFactory } from './utils'

export function reducer<S>(model: Model<S>) {
  return <P>(reducerFunc: ReducerFunc<S, P>): Dispatcher<P> => {
    function getState() {
      return model.state
    }

    function onStateUpdate(newState: any) {
      if (!model.isDisposed) {
        model[StateSourceSymbol].next(newState)
      }
    }

    return dispatcherFactory((payload: P) => {
      // `produce` support return `Promise` and `nothing`, but `reducer` don't.
      const newState = produce(getState(), (state) => reducerFunc(state, payload)) as S
      onStateUpdate(newState)
    })
  }
}
