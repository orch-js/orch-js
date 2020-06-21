import * as React from 'react'

import { ContextModelContextEntriesValue } from './context-model-context'
import { ContextModelProvider } from './context-model-provider'

export function withContextModelProvider<P>(
  Component: React.ComponentType<P>,
  useGetModelContextValue: (props: P) => ContextModelContextEntriesValue,
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
