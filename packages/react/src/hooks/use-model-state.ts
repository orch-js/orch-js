import React from 'react'

import { OrchModel, OrchModelState } from '@orch/core'

const defaultSelector = <M extends OrchModel<any>>(model: M) => model.state

export function useModelState<M extends OrchModel<any>>(model: M): OrchModelState<M>
export function useModelState<R, M extends OrchModel<any>>(
  model: M,
  inlineSelector: (model: M) => R,
  inlineSelectorDeps: React.DependencyList,
): R
export function useModelState(
  model: OrchModel<any>,
  inlineSelector?: (model: OrchModel<any>) => any,
  inlineSelectorDeps: React.DependencyList = [],
): any {
  const getSnapshot = React.useCallback(() => model.state, [model])
  const state = React.useSyncExternalStore(model.onChange, getSnapshot, getSnapshot)

  return React.useMemo(
    () => (inlineSelector ?? defaultSelector)(model),
    [state, ...inlineSelectorDeps],
  )
}
