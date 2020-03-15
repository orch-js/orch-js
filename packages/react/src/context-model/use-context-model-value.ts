import * as React from 'react'

import { Model, ModelToOrch } from '@orch/model'

import {} from '../hooks'
import { ModelContext } from './model-context'

export function useContextModelValue<M extends Model<any>>(
  ModelClass: new (...params: any[]) => M,
): ModelToOrch<M> {
  const context = React.useContext(ModelContext)
  const orch = React.useMemo(() => context.get(ModelClass), [context])

  if (orch) {
    return orch
  } else {
    throw new Error(`There is no instance for ${ModelClass}`)
  }
}
