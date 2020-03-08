import * as React from 'react'
import { hydrate } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'

import { OrchStore } from '@orch/store'
import { StoreProvider } from '@orch/react'

import { App } from './app'

const store = new OrchStore({ serializedOrchStore: (window as any).STORE_DATA })

hydrate(
  <StoreProvider value={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StoreProvider>,
  document.getElementById('app'),
)
