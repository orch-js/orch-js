import * as React from 'react'
import { getModel } from '@orch/model'

export const useModelInstance: typeof getModel = (ModelClass, params, defaultState) => {
  const model = React.useMemo(() => getModel(ModelClass, params, defaultState), [
    ModelClass,
    ...params,
  ])

  React.useEffect(() => () => model.disposeModel(), [model])

  return model
}
