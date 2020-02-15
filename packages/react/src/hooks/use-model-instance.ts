import * as React from 'react'
import { Model } from '@orch/model'

import { ModelConstructor, ConstructorParams } from '../types'

export function useModelInstance<Instance extends Model<any>, Params extends any[]>(
  ModelClass: ModelConstructor<Instance, Params>,
  params: ConstructorParams<ModelConstructor<Instance, Params>>,
  defaultState?: Instance extends Model<infer SS> ? SS : never,
): Instance {
  const model = React.useMemo(() => {
    const instance = new ModelClass(...params)

    instance.activateModel(defaultState)

    return instance
  }, [ModelClass, ...params])

  React.useEffect(() => () => model.disposeModel(), [model])

  return model
}
