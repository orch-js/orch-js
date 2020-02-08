import produce from 'immer'

import { ReducerFunc, Dispatcher } from './types'
import { dispatcher } from './utils'

type Config<S> = {
  getState: () => S
  onStateUpdate: (state: S) => void
}

export function reducerFactory<S>({ getState, onStateUpdate }: Config<S>) {
  return <P>(reducer: ReducerFunc<S, P>): Dispatcher<P> =>
    dispatcher<P>((payload) => {
      // `produce` support return `Promise` and `nothing`, but `reducer` don't.
      const newState = produce(getState(), (state) => reducer(state, payload)) as S
      onStateUpdate(newState)
    })
}
