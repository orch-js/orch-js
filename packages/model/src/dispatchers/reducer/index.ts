import produce, { Draft } from 'immer'
import { map, tap, withLatestFrom } from 'rxjs/operators'

import { Model } from '@orch/model/model'

import { dispatcherFactory } from '../utils'

export type ReducerFunc<S, P> = (state: Draft<S>, payload: P) => S | void

export function reducer<S>(model: Model<S>) {
  return <P>(reducerFunc: ReducerFunc<S, P>) => {
    return dispatcherFactory<S, P>(model, ({ payload$, state$, setState }) =>
      payload$.pipe(
        withLatestFrom(state$),
        map(([payload, currentState]) => {
          // `produce` support return `Promise` and `nothing`, but `reducer` don't.
          return produce(currentState, (state) => reducerFunc(state, payload)) as S
        }),
        tap(setState),
      ),
    )
  }
}
