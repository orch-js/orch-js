import * as React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import { PATH } from './routers'
import { Home, Detail } from './pages'

export const App = () => (
  <BrowserRouter>
    <Switch>
      <Route path={PATH.detail} component={Detail} />
      <Route component={Home} />
    </Switch>
  </BrowserRouter>
)
