import * as React from 'react'
import produce from 'immer'

import { OrchModel } from '@orch/model'

import { ModelContext, ModelContextValue, ModelConstructor } from './model-context'

export type ContextModelProviderProps = {
  ModelClass: ModelConstructor<OrchModel<any>>
  modelInstance: OrchModel<any>
  children: React.ReactNode
}

type Props = ContextModelProviderProps

export function ContextModelProvider({ ModelClass, modelInstance, children }: Props) {
  const context = React.useContext(ModelContext)

  const value = React.useMemo(() => {
    return produce(context, (ctx: ModelContextValue) => {
      ctx.set(ModelClass, modelInstance)
    })
  }, [context, ModelClass, modelInstance])

  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>
}
