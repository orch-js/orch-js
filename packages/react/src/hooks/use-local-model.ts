import { useMemo, useEffect } from 'react'
import { initModel, OrchModelConstructor, InitiatedOrchModel, OrchModelParams } from '@orch/model'

export function useLocalModel<T extends OrchModelConstructor<any, any>>(
  Model: T,
  ...params: OrchModelParams<T>
): InitiatedOrchModel<T> {
  const [destroyModel, model] = useMemo(() => initModel(Model, ...params), [Model, ...params])

  useEffect(() => destroyModel, [destroyModel])

  return model
}
