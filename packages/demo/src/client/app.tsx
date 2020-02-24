import * as React from 'react'
import { Switch, Route } from 'react-router-dom'

import { PATH } from './routers'
import { Home, Detail } from './pages'

export const App = () => (
  <Switch>
    <Route path={PATH.detail} component={Detail} />
    <Route component={Home} />
  </Switch>
)
