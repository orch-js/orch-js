import { merge, Observable } from 'rxjs'
import { catchError } from 'rxjs/operators'

import { Orch, Performer, registerPerformer, PerformerAction, CaseId, Namespace } from '@orch/store'

import { Model } from '../model'
import { getModelDisplayName } from '../utils'
import { ModelState, ModelActions, ModelToOrch } from '../types'

type ModelToOrchConfig<M extends Model<any>> = {
  model: M
  defaultState?: ModelState<M>
  caseId: CaseId | undefined
  namespace: Namespace
}

export function modelToOrch<M extends Model<any>>({
  model,
  defaultState = model.defaultState,
  caseId,
  namespace,
}: ModelToOrchConfig<M>): ModelToOrch<M> {
  return new Orch<ModelState<M>, ModelActions<M>>({ defaultState }, (orchState) => {
    const actions: Record<string, (payload: any) => void> = {}
    const process$Array: Observable<PerformerAction>[] = []

    Object.keys(model).forEach((key) => {
      const performer = (model as any)[key]

      if (performer instanceof Performer) {
        const { action, process$ } = performer.record(orchState, { caseId, namespace })

        const processWithErrorCatch$ = process$.pipe(
          catchError((err, caught$) => {
            console.error(
              `An error occurred at model ${getModelDisplayName(model)}[${key}]:\n ${err}`,
            )
            return caught$
          }),
        )

        registerPerformer(performer, { namespace, actionName: key })
        actions[key] = action
        process$Array.push(processWithErrorCatch$)
      }
    })

    return {
      actions: actions as ModelActions<M>,
      process$: merge(...process$Array),
    }
  })
}
