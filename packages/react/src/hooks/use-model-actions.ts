import { OrchModel, ModelActions } from '@orch/model'
import { useRegisterModel, UseRegisterModelConfig } from '@orch/react'

type UseModelActionsConfig<M extends OrchModel<any>> = UseRegisterModelConfig<M>

export function useModelActions<M extends OrchModel<any>>(
  ModelClass: new (...params: any) => M,
  config: UseModelActionsConfig<M> = {},
): ModelActions<M> {
  const orch = useRegisterModel(ModelClass, config)
  return orch.actions
}
