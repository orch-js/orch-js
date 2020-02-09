import * as React from 'react'

import { Model } from '@orch/model'

type ModelConstructor = Function

export type ModelContextValue = Map<ModelConstructor, Model<any>>

export const ModelContext = React.createContext<ModelContextValue>(new Map())
