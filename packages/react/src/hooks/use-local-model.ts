import { useMemo, useEffect } from 'react'
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
): InitiatedOrchModel<T> {
  const model = useMemo(() => new Model(...params), [Model, ...params])
  const lockId = useMemo(() => preventOthersToDisposeModel(model), [model])

  useEffect(() => () => disposeModel(model, lockId), [model, lockId])

  return model
}
