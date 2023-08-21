import React from 'react'

import type { OrchModel } from '@orch/core'

import { ContextModelProvider } from './context-model-provider'

export function withContextModelProvider<P extends NonNullable<unknown>>(
  Component: React.ComponentType<P>,
  useGetModelContextValue: (props: P) => OrchModel<any>[],
): React.ComponentType<P> {
  return (props) => {
    const value = useGetModelContextValue(props)

    return (
      <ContextModelProvider value={value}>
        <Component {...props} />
      </ContextModelProvider>
    )
  }
}
