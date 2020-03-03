import { Observable } from 'rxjs'
import { filter, groupBy, mergeMap } from 'rxjs/operators'
import { Performer, performerAction, PerformerAction, CaseId } from '@orch/store'

import { nonNullable, addCaseIdIfIsCurrentModelAction } from './effect.utils'
import { ssrAware, isSsrAction, handleSsrAction, SsrActionType } from './effect.ssr'

export type EffectFunc<P, S> = (
  payload$: Observable<P>,
  state$: Observable<S>,
  caseId: CaseId,
) => Observable<PerformerAction | null | SsrActionType>

export { ssrAware, performerAction as action }

export const EMPTY_ACTION = null

export function effect<P, S = void>(effect: EffectFunc<P, S>) {
  return new Performer<P, S>((payload$, orchState, { namespace, caseId, store }) =>
    effect(payload$, orchState.state$, caseId).pipe(
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
    ),
  )
}
