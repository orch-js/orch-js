import React from 'react'

import { ContextModelContext, ContextModelContextEntriesValue } from './context-model-context'

export type ContextModelProviderProps = {
  value: ContextModelContextEntriesValue
  children: React.ReactNode
}

export function ContextModelProvider({ value, children }: ContextModelProviderProps) {
  const context = React.useContext(ContextModelContext)

  const providerValue = React.useMemo(
    () => new Map(Array.from(context.entries()).concat(value)),
    [context, value],
  )

  return (
    <ContextModelContext.Provider value={providerValue}>{children}</ContextModelContext.Provider>
  )
}
