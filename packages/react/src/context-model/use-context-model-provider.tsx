import * as React from 'react'
import { StrictOmit } from 'ts-essentials'

import { OrchModel } from '@orch/model'

import { ContextModelProvider, ContextModelProviderProps } from './context-model-provider'

export function useContextModelProvider<M extends OrchModel<any>>(
  ModelClass: new (...params: any) => M,
  modelInstance: M,
) {
  return React.useCallback(
    (props: StrictOmit<ContextModelProviderProps, 'modelInstance' | 'ModelClass'>) => (
      <ContextModelProvider {...props} modelInstance={modelInstance} ModelClass={ModelClass} />
    ),
    [modelInstance, ModelClass],
  )
}
