import React from 'react'

import { ConstructorType, OrchModel } from '@orch/core'

export const ContextModelContext = React.createContext<
  Map<ConstructorType<OrchModel<any>>, OrchModel<any>>
>(new Map())
