import * as React from 'react'
import produce from 'immer'

import {
  ContextModelContext,
  ContextModelContextValue,
  ContextModelContextEntriesValue,
} from './context-model-context'

export type ContextModelProviderProps = {
  value: ContextModelContextEntriesValue
  children: React.ReactNode
}

export function ContextModelProvider({ value, children }: ContextModelProviderProps) {
  const context = React.useContext(ContextModelContext)

  const providerValue = React.useMemo(
    () =>
      produce(context, (ctx: ContextModelContextValue) => {
        value.forEach(([ModelClass, modelInstance]) => {
          ctx.set(ModelClass, modelInstance)
        })
      }),
    [context, value],
  )

  return (
    <ContextModelContext.Provider value={providerValue}>{children}</ContextModelContext.Provider>
  )
}
