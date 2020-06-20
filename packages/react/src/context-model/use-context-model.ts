import * as React from 'react'

import { OrchModel } from '@orch/model'
import { ConstructorType } from '@orch/utility-types'

import { OrchModelContext } from './orch-model-context'

export function useContextModel<M extends OrchModel<any>>(ModelClass: ConstructorType<M>): M {
  const context = React.useContext(OrchModelContext)
  const model = React.useMemo(() => context.get(ModelClass) as M, [context])

  if (model) {
    return model
  } else {
    throw new Error(`There is no instance for ${ModelClass}`)
  }
}
