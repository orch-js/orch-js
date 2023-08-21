import React from 'react'

import { ConstructorType, OrchModel } from '@orch/core'

import { ContextModelContext } from './context-model-context'

export function useContextModel<M extends OrchModel<any>>(ModelClass: ConstructorType<M>): M {
  const context = React.useContext(ContextModelContext)
  const model = React.useMemo(() => context.get(ModelClass), [context])

  if (model) {
    return model as M
  } else {
    throw new Error(`There is no instance for ${ModelClass}`)
  }
}
