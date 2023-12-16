import React from 'react'

import { ConstructorType, OrchModel, OrchModelState } from '@orch/core'

import { useModelState } from '../hooks/use-model-state'
import { ContextModelContext } from './context-model-context'

export function useContextModel<M extends OrchModel<any>, S>(
  ModelClass: ConstructorType<M>,
  selector: (state: OrchModelState<M>, model: M) => S,
  deps: React.DependencyList,
): S

export function useContextModel<M extends OrchModel<any>>(ModelClass: ConstructorType<M>): M

export function useContextModel<M extends OrchModel<any>, S>(
  ModelClass: ConstructorType<M>,
  selector?: (state: OrchModelState<M>, model: M) => S,
  deps: React.DependencyList = [],
): S | M {
  const context = React.useContext(ContextModelContext)
  const model = React.useMemo(
    () => context.get(ModelClass) as OrchModelState<M>,
    [context, ModelClass],
  )

  if (model) {
    if (selector) {
      return useModelState(model, selector, deps)
    } else {
      return model as M
    }
  } else {
    throw new Error(`There is no instance for ${ModelClass}`)
  }
}
