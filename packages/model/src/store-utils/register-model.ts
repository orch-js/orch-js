import { OrchStore, CaseId } from '@orch/store'

import { ModelToOrch, ModelState } from '../types'
import { Model } from '../model'
import { getModelNamespace } from '../utils'

import { modelToOrch } from './model-to-orch'

export type RegisterModelConfig<M extends Model<any>> = {
  store: OrchStore
  model: M
  caseId?: CaseId
  defaultState?: ModelState<M>
}

export function registerModel<M extends Model<any>>({
  store,
  model,
  caseId,
  defaultState,
}: RegisterModelConfig<M>): ModelToOrch<M> {
  const namespace = getModelNamespace(model)

  return store.registerOrch({
    namespace,
    caseId,
    createOrch: (ssrState) => {
      return modelToOrch({
        store,
        model,
        caseId,
        namespace,
        defaultState: ssrState ?? defaultState,
      })
    },
  })
}
