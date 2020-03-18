import produce, { Draft } from 'immer'
import { NEVER } from 'rxjs'
import { map, tap, withLatestFrom, switchMapTo } from 'rxjs/operators'

import { Performer } from '@orch/store'

export type ReducerFunc<S, P> = (state: Draft<S>, payload: P) => S | void

export function reducer<S, P = void>(reducerFunc: ReducerFunc<S, P>) {
  return new Performer<P, S>(({ payload$, orchState }) =>
    payload$.pipe(
      withLatestFrom(orchState.state$),
      map(([payload, currentState]) => {
        // `produce` support return `Promise` and `nothing`, but `reducer` don't.
        return produce(currentState, (state) => reducerFunc(state, payload)) as S
      }),
      tap((newState) => orchState.setState(newState)),
      switchMapTo(NEVER),
    ),
  )
}
