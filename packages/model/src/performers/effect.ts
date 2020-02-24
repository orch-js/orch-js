import { Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'

import { Performer, performerAction, PerformerAction } from '@orch/store'
import { CaseId } from '@orch/store/types'

export type EffectFunc<P, S> = (
  payload$: Observable<P>,
  state$: Observable<S>,
  caseId: CaseId,
) => Observable<PerformerAction | null>

export const action = performerAction

export const EMPTY_ACTION = null

export function effect<P, S = void>(effect: EffectFunc<P, S>) {
  return new Performer<P, S>((payload$, orchState, { namespace, caseId }) =>
    effect(payload$, orchState.state$, caseId).pipe(
      filter(
        <T>(performerAction: T): performerAction is NonNullable<T> => performerAction !== null,
      ),
      map((action) => {
        const isCurrentModelAction = action.namespace === namespace

        if (isCurrentModelAction) {
          return { ...action, caseId: action.caseId ?? caseId }
        } else {
          return action
        }
      }),
    ),
  )
}
