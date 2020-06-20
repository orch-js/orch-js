import { useMemo, useEffect } from 'react'
import {
  disposeModel,
  OrchModelConstructor,
  InitiatedOrchModel,
  OrchModelParams,
} from '@orch/model'

export function useLocalModel<T extends OrchModelConstructor<any, any>>(
  Model: T,
  params: OrchModelParams<T>,
): InitiatedOrchModel<T> {
  const model = useMemo(() => new Model(...params), [Model, ...params])

  useEffect(() => () => disposeModel(model), [model])

  return model
}
