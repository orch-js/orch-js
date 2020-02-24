import * as React from 'react'
import { OrchStore } from '@orch/store'

import { StoreContext } from '../store-context'

type TempStoreProviderProps = {
  children: React.ReactNode
}

export const TempStoreProvider = ({ children }: TempStoreProviderProps) => {
  const store = React.useMemo(() => new OrchStore(), [])

  React.useEffect(() => () => store.destroyStore(), [store])

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}
