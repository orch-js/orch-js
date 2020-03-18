import { merge, Observable } from 'rxjs'
import { catchError } from 'rxjs/operators'

import {
  OrchStore,
  Orch,
  Performer,
  registerPerformer,
  PerformerAction,
  CaseId,
  Namespace,
} from '@orch/store'

import { OrchModel } from '../orch-model'
import { getModelDisplayName } from '../utils'
import { ModelState, ModelActions, ModelToOrch } from '../types'

type ModelToOrchConfig<M extends OrchModel<any>> = {
  model: M
  defaultState?: ModelState<M>
  caseId: CaseId | undefined
  namespace: Namespace
  store: OrchStore
}

export function modelToOrch<M extends OrchModel<any>>({
  model,
  caseId,
  store,
  defaultState = model.defaultState,
  namespace,
}: ModelToOrchConfig<M>): ModelToOrch<M> {
  return new Orch<ModelState<M>, ModelActions<M>>({ defaultState }, (orchState) => {
    const actions: Record<string, (payload: any) => void> = {}
    const process$Array: Observable<PerformerAction>[] = []

    Object.keys(model).forEach((key) => {
      const performer = (model as any)[key]

      if (performer instanceof Performer) {
        const { action, process$ } = performer.record(orchState, { caseId, namespace, store })

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
