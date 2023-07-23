import * as React from 'react'

import {
  disposeModel,
  InitiatedOrchModel,
  OrchModelConstructor,
  OrchModelParams,
  preventOthersToDisposeModel,
} from '@orch/model'

export function useLocalModel<T extends OrchModelConstructor<any, any>>(
  Model: T,
  params: OrchModelParams<T>,
  extraDeps: React.DependencyList = [],
): InitiatedOrchModel<T> {
  const model = React.useMemo(
    () => new Model(...(params as any)),
    [Model, ...(params as any), ...extraDeps],
  )
  const lockId = React.useMemo(() => preventOthersToDisposeModel(model), [model])

  React.useEffect(() => () => disposeModel(model, lockId), [model, lockId])

  return model
}
