import React from 'react'

import { OrchModel, ConstructorType } from '@orch/model'

export type ContextModelContextValue = Map<ConstructorType<OrchModel<any>>, OrchModel<any>>

export type ContextModelContextEntriesValue = [ConstructorType<OrchModel<any>>, OrchModel<any>][]

export const ContextModelContext = React.createContext<ContextModelContextValue>(new Map())
