import * as React from 'react'

import { Model } from '@orch/model'

import { ModelConstructor } from '../types'
import { ModelContext } from './model-context'

export function useContextModel<M extends Model<any>>(ModelClass: ModelConstructor<M, any>): M {
  const context = React.useContext(ModelContext)
  const model = React.useMemo(() => context.get(ModelClass) as M | undefined, [context])

  if (!model) {
    throw new Error(`There is no instance for ${ModelClass}`)
  }

  return model
}
