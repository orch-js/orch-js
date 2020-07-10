import React from 'react'

import { OrchModel } from '@orch/model'

import { useOrchState } from './use-orch-state'

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
  return useOrchState(model.state, inlineSelector, inlineSelectorDeps)
}
