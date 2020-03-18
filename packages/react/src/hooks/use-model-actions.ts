import { OrchModel, ModelActions } from '@orch/model'
import { useRegisterModel, UseRegisterModelConfig } from '@orch/react'
import { StrictOmit } from 'ts-essentials'

type UseModelActionsConfig<M extends OrchModel<any>> = StrictOmit<
  UseRegisterModelConfig<M>,
  'caseId'
>

export function useModelActions<M extends OrchModel<any>>(
  ModelClass: new (...params: any) => M,
  config: UseModelActionsConfig<M> = {},
): ModelActions<M> {
  const orch = useRegisterModel(ModelClass, config)
  return orch.actions
}
