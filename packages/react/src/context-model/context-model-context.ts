import * as React from 'react'

import { ConstructorType } from '@orch/utility-types/src'
import { OrchModel } from '@orch/model/orch-model'

export type ContextModelContextValue = Map<ConstructorType<OrchModel<any>>, OrchModel<any>>

export type ContextModelContextEntriesValue = [ConstructorType<OrchModel<any>>, OrchModel<any>][]

export const ContextModelContext = React.createContext<ContextModelContextValue>(new Map())
