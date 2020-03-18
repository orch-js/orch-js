import { OrchStore, CaseId } from '@orch/store'

import { ModelToOrch } from '../types'
import { getModelNamespace } from '../utils'
import { OrchModel } from '../orch-model'

export type GetRegisteredOrchConfig<M extends OrchModel<any>> = {
  store: OrchStore
  model: M
  caseId?: CaseId
}

export function getRegisteredOrch<M extends OrchModel<any>>({
  store,
  model,
  caseId,
}: GetRegisteredOrchConfig<M>): ModelToOrch<M> | null {
  const namespace = getModelNamespace(model, store.ssrWaitingGroup.enabled)

  return store.getRegisteredOrch({ namespace, caseId }) ?? null
}
