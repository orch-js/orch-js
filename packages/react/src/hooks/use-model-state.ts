import React from 'react'

import { OrchModel } from '@orch/core'

const defaultSelector = <S>(state: S): S => state

export function useModelState<S>(model: OrchModel<S>): S
export function useModelState<S, R>(
  model: OrchModel<S>,
  inlineSelector: (state: S) => R,
  inlineSelectorDeps?: React.DependencyList,
): R
export function useModelState<S, R>(
  model: OrchModel<S>,
  inlineSelector?: (state: S) => R,
  inlineSelectorDeps?: React.DependencyList,
): R
export function useModelState(
  model: OrchModel<any>,
  inlineSelector?: (state: any) => any,
  inlineSelectorDeps: React.DependencyList = [],
): any {
  const getSnapshot = React.useCallback(() => model.current, [model])
  const state = React.useSyncExternalStore(model.onChange, getSnapshot, getSnapshot)

  return React.useMemo(
    () => (inlineSelector ?? defaultSelector)(state),
    [state, ...inlineSelectorDeps],
  )
}
