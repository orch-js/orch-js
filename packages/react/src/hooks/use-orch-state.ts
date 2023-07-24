import React from 'react'

import { OrchState } from '@orch/core'

const defaultSelector = <S>(state: S): S => state

export function useOrchState<S>(orchState: OrchState<S>): S
export function useOrchState<S, R>(
  orchState: OrchState<S>,
  inlineSelector: (state: S) => R,
  inlineSelectorDeps?: React.DependencyList,
): R
export function useOrchState<S, R>(
  orchState: OrchState<S>,
  inlineSelector?: (state: S) => R,
  inlineSelectorDeps?: React.DependencyList,
): R
export function useOrchState(
  orchState: OrchState<any>,
  inlineSelector: (state: any) => any = defaultSelector,
  inlineSelectorDeps: React.DependencyList = [],
): any {
  const getSnapshot = React.useCallback(() => orchState.current, [orchState])
  const state = React.useSyncExternalStore(orchState.onChange, getSnapshot, getSnapshot)

  return React.useMemo(() => inlineSelector(state), [state, ...inlineSelectorDeps])
}
