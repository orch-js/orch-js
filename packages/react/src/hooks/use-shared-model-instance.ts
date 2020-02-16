import * as React from 'react'

import { Model, getSharedModel } from '@orch/model'

import { ModelConstructor } from '../types'

export function useSharedModelInstance<M extends Model<any>>(
  ModelClass: ModelConstructor<M, any>,
): M {
  return React.useMemo((): M => getSharedModel(ModelClass), [ModelClass])
}
