import * as React from 'react'
import produce from 'immer'

import { Orch } from '@orch/store'
import { Model } from '@orch/model'

import { ModelContext, ModelContextValue, ModelConstructor } from './model-context'

export type ContextModelProviderProps = {
  ModelClass: ModelConstructor<Model<any>>
  orch: Orch<any, any>
  children: React.ReactNode
}

type Props = ContextModelProviderProps

export function ContextModelProvider({ ModelClass, orch, children }: Props) {
  const context = React.useContext(ModelContext)

  const value = React.useMemo(() => {
    return produce(context, (ctx: ModelContextValue) => {
      ctx.set(ModelClass, orch)
    })
  }, [context, ModelClass, orch])

  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>
}
