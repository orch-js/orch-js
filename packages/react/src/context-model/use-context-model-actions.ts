import { OrchModel, ModelActions } from '@orch/model'

import { useContextModelValue } from './use-context-model-value'

export function useContextModelActions<M extends OrchModel<any>>(
  ModelClass: new (...params: any) => M,
): ModelActions<M> {
  const orch = useContextModelValue(ModelClass)
  return orch.actions
}
