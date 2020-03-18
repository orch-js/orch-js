import * as React from 'react'

import { OrchModel } from '@orch/model'
import { Orch } from '@orch/store'

export type ModelConstructor<M extends OrchModel<any>> = new (...params: any[]) => M

export type ModelContextValue = Map<ModelConstructor<OrchModel<any>>, Orch<any, any>>

export const ModelContext = React.createContext<ModelContextValue>(new Map())
