import { useMemo, useEffect, DependencyList } from 'react'
import {
  disposeModel,
  preventOthersToDisposeModel,
  OrchModelConstructor,
  InitiatedOrchModel,
  OrchModelParams,
} from '@orch/model'

export function useLocalModel<T extends OrchModelConstructor<any, any>>(
  Model: T,
  params: OrchModelParams<T>,
  extraDeps: DependencyList = [],
): InitiatedOrchModel<T> {
  const model = useMemo(
    () => new Model(...(params as any)),
    [Model, ...(params as any), ...extraDeps],
  )
  const lockId = useMemo(() => preventOthersToDisposeModel(model), [model])

  useEffect(() => () => disposeModel(model, lockId), [model, lockId])

  return model
}
