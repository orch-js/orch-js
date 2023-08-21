import * as React from 'react'

import {
  activate,
  autoActivate,
  deactivate,
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
    () => autoActivate.deferActivation(() => new Model(...(params as any))),
    [Model, ...(params as any), ...extraDeps],
  )

  React.useEffect(() => {
    activate(model)
    return () => deactivate(model)
  }, [model])

  return model
}
