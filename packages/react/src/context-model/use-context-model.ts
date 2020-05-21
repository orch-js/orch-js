import * as React from 'react'

import { OrchModel } from '@orch/model'

import { ModelContext } from './model-context'

export function useContextModel<M extends OrchModel<any>>(
  ModelClass: new (...params: any) => M,
): M {
  const context = React.useContext(ModelContext)
  const model = React.useMemo(() => context.get(ModelClass) as M, [context])

  if (model) {
    return model
  } else {
    throw new Error(`There is no instance for ${ModelClass}`)
  }
}
