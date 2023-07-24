import React from 'react'

import { ConstructorType, OrchModel } from '@orch/core'

export type ContextModelContextValue = Map<ConstructorType<OrchModel<any>>, OrchModel<any>>

export type ContextModelContextEntriesValue = [ConstructorType<OrchModel<any>>, OrchModel<any>][]

export const ContextModelContext = React.createContext<ContextModelContextValue>(new Map())
