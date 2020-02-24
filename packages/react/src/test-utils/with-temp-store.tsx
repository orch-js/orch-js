import * as React from 'react'

import { TempStoreProvider } from './temp-store-provider'

export function withTempStore<P>(Component: React.ComponentType<P>) {
  // eslint-disable-next-line react/display-name
  return (props: P) => (
    <TempStoreProvider>
      <Component {...props} />
    </TempStoreProvider>
  )
}
