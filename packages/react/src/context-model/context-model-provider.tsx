import React from 'react'

import { OrchModel } from '@orch/core'

import { ContextModelContext } from './context-model-context'

export type ContextModelProviderProps = {
  value: OrchModel<any>[]
  children: React.ReactNode
}

export function ContextModelProvider({ value, children }: ContextModelProviderProps) {
  const context = React.useContext(ContextModelContext)

  const providerValue = React.useMemo(
    () =>
      new Map(
        Array.from(context.entries()).concat(
          value.map((model) => [Object.getPrototypeOf(model).constructor, model]),
        ),
      ),
    [context, ...value],
  )

  return (
    <ContextModelContext.Provider value={providerValue}>{children}</ContextModelContext.Provider>
  )
}
