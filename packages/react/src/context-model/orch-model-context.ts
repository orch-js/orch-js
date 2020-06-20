import * as React from 'react'

import { ConstructorType } from '@orch/utility-types/src'
import { OrchModel } from '@orch/model/orch-model'

export type OrchModelContextValue = Map<ConstructorType<OrchModel<any>>, OrchModel<any>>

export type ModelContextEntriesValue = [ConstructorType<OrchModel<any>>, OrchModel<any>][]

export const OrchModelContext = React.createContext<OrchModelContextValue>(new Map())
