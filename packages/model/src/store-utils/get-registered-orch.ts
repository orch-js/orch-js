import { OrchStore } from '@orch/store'
import { CaseId } from '@orch/store/types'

import { ModelToOrch } from '../types'
import { getModelNamespace } from '../utils'
import { Model } from '../model'

export type GetRegisteredOrchConfig<M extends Model<any>> = {
  store: OrchStore
  model: M
  caseId?: CaseId
}

export function getRegisteredOrch<M extends Model<any>>({
  store,
  model,
  caseId,
}: GetRegisteredOrchConfig<M>): ModelToOrch<M> | null {
  const namespace = getModelNamespace(model)

  return store.getRegisteredOrch({ namespace, caseId }) ?? null
}
