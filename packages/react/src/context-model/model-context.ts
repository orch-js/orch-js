import * as React from 'react'

import { Model } from '@orch/model'
import { Orch } from '@orch/store'

export type ModelConstructor<M extends Model<any>> = new (...params: any[]) => M

export type ModelContextValue = Map<ModelConstructor<Model<any>>, Orch<any, any>>

export const ModelContext = React.createContext<ModelContextValue>(new Map())
