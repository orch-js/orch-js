import * as React from 'react'
import { Model } from '@orch/model'

type ModelConstructor<Instance extends Model<any>, Params extends any[]> = new (
  ...params: Params
) => Instance

export function useGetModelInstance<M extends Model<any>, Params extends any[]>(
  ModelClass: ModelConstructor<M, Params>,
  params: ConstructorParameters<ModelConstructor<M, Params>>,
) {
  return React.useMemo(() => new ModelClass(...params), [ModelClass, ...params])
}
