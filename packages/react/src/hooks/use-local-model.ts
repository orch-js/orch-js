import * as React from 'react'

import {
  dispose,
  setup,
  type InitiatedOrchModel,
  type OrchModelConstructor,
  type OrchModelParams,
} from '@orch/core'

export function useLocalModel<T extends OrchModelConstructor<any, any>>(
  Model: T,
  params: OrchModelParams<T>,
  extraDeps: React.DependencyList = [],
): InitiatedOrchModel<T> {
  const model = React.useMemo(
    () => new Model(...(params as any)),
    [Model, ...(params as any), ...extraDeps],
  )

  React.useEffect(() => {
    setup(model)
    return () => dispose(model)
  }, [model])

  return model
}
