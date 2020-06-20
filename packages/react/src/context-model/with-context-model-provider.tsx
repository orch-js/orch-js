import * as React from 'react'

import { ModelContextEntriesValue } from './orch-model-context'
import { ContextModelProvider } from './context-model-provider'

export function withContextModelProvider<P>(
  Component: React.ComponentType<P>,
  useGetModelContextValue: (props: P) => ModelContextEntriesValue,
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
