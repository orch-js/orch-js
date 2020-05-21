import * as React from 'react'

import { OrchModel } from '@orch/model'

export type ModelConstructor<M extends OrchModel<any>> = new (...params: any[]) => M

export type ModelContextValue = Map<ModelConstructor<OrchModel<any>>, OrchModel<any>>

export const ModelContext = React.createContext<ModelContextValue>(new Map())
