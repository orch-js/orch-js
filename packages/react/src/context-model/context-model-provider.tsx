import * as React from 'react'
import produce from 'immer'

import { Model } from '@orch/model'

import { ModelContext, ModelContextValue } from './model-context'

export type ContextModelProviderProps = {
  model: Model<any>
  children: React.ReactNode
}

type Props = ContextModelProviderProps

export function ContextModelProvider({ model, children }: Props) {
  const context = React.useContext(ModelContext)
  const memo = React.useMemo(
    () =>
      produce(context, (ctx: ModelContextValue) => {
        // TODO(SSR): - `constructor` cannot be serialized, using compiler to add ue id for each model.
        ctx.set(model.constructor, model)
      }),
    [context, model],
  )

  return <ModelContext.Provider value={memo}>{children}</ModelContext.Provider>
}
