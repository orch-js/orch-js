import React from 'react'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'

import { OrchModel, OrchModelState } from '@orch/core'

const defaultSelector = <M extends OrchModel<any>>(state: OrchModelState<M>) => state

export function useModelState<M extends OrchModel<any>>(model: M): OrchModelState<M>
export function useModelState<R, M extends OrchModel<any>>(
  model: M,
  inlineSelector: (state: OrchModelState<M>, model: M) => R,
  deps: React.DependencyList,
  isEqual?: (a: R, b: R) => boolean,
): R
export function useModelState(
  model: OrchModel<any>,
  inlineSelector?: (state: OrchModelState<any>, model: OrchModel<any>) => any,
  deps: React.DependencyList = [],
  isEqual?: (a: any, b: any) => boolean,
): any {
  const onChange = React.useCallback((notify: () => void) => model.on.change(notify), [model])

  const getSnapshot = React.useCallback(() => model.getState(), [model])

  const selector = React.useCallback(
    () => (inlineSelector ?? defaultSelector)(model.getState(), model),
    [model, ...deps],
  )

  return useSyncExternalStoreWithSelector(onChange, getSnapshot, getSnapshot, selector, isEqual)
}
