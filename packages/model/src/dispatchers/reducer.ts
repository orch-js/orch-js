import produce from 'immer'
import { map, tap, withLatestFrom } from 'rxjs/operators'

import { Model } from '../model'
import { ReducerFunc } from './types'
import { dispatcherFactory } from './utils'

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
