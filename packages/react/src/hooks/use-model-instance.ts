import * as React from 'react'
import { Model } from '@orch/model'

import { ConstructorType, ConstructorParams } from '../types'

export function useModelInstance<Instance extends Model<any>, Params extends any[]>(
  ModelClass: ConstructorType<Instance, Params>,
  params: ConstructorParams<ConstructorType<Instance, Params>>,
): Instance {
  const model = React.useMemo(() => new ModelClass(...params), params)

  React.useEffect(() => () => model.dispose(), [model])

  return model
}
