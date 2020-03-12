import 'reflect-metadata'
import * as React from 'react'
import { Switch, Route } from 'react-router-dom'
import { container } from 'tsyringe'
import { ModelConfig } from '@orch/model'

import { PATH } from './routers'
import { Home, Detail } from './pages'

ModelConfig.resolveModel = (ModelClass) => container.resolve(ModelClass)

export const App = () => (
  <Switch>
    <Route path={PATH.detail} component={Detail} />
    <Route component={Home} />
  </Switch>
)
