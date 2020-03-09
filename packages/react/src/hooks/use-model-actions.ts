import * as React from 'react'

import { getSharedModelInstance, Model, ModelActions } from '@orch/model'
import { useRegisterModel, UseRegisterModel } from '@orch/react'

type UseModelActionsConfig<M extends Model<any>> = UseRegisterModel<M>

export function useModelActions<M extends Model<any>>(
  ModelClass: new (...params: any) => M,
  config: UseModelActionsConfig<M> = {},
): ModelActions<M> {
  const model = React.useMemo(() => getSharedModelInstance(ModelClass), [ModelClass])
  const orch = useRegisterModel(model, config)
  return orch.actions
}
