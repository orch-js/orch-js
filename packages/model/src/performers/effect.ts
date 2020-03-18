import { Observable } from 'rxjs'
import { filter, groupBy, mergeMap } from 'rxjs/operators'
import { Performer, performerAction, PerformerAction, PerformerFactoryMeta } from '@orch/store'

import { nonNullable, addCaseIdIfIsCurrentModelAction } from './effect.utils'
import { ssrAware, isSsrAction, handleSsrAction, SsrActionType } from './effect.ssr'

export type EffectFunc<S, P> = (params: {
  payload$: Observable<P>
  state$: Observable<S>
  meta: Required<PerformerFactoryMeta>
}) => Observable<PerformerAction | null | SsrActionType>

export { ssrAware, performerAction as action }

export const EMPTY_ACTION = null

export function effect<S, P = void>(effect: EffectFunc<S, P>) {
  return new Performer<P, S>((payload$, orchState, meta) => {
    const { store, namespace, caseId } = meta

    return effect({ payload$, state$: orchState.state$, meta }).pipe(
      filter(nonNullable),
      groupBy(isSsrAction),
      mergeMap(
        (actions$): Observable<PerformerAction> => {
          const isSsrAction = actions$.key

          if (isSsrAction) {
            return (actions$ as Observable<SsrActionType>).pipe(handleSsrAction(store))
          } else {
            return (actions$ as Observable<PerformerAction>).pipe(
              addCaseIdIfIsCurrentModelAction({ namespace, caseId }),
            )
          }
        },
      ),
    )
  })
}
