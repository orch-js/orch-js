import * as React from 'react'
import produce from 'immer'

import {
  OrchModelContext,
  OrchModelContextValue,
  ModelContextEntriesValue,
} from './orch-model-context'

export type ContextModelProviderProps = {
  value: ModelContextEntriesValue
  children: React.ReactNode
}

export function ContextModelProvider({ value, children }: ContextModelProviderProps) {
  const context = React.useContext(OrchModelContext)

  const providerValue = React.useMemo(
    () =>
      produce(context, (ctx: OrchModelContextValue) => {
        value.forEach(([ModelClass, modelInstance]) => {
          ctx.set(ModelClass, modelInstance)
        })
      }),
    [context, value],
  )

  return <OrchModelContext.Provider value={providerValue}>{children}</OrchModelContext.Provider>
}
