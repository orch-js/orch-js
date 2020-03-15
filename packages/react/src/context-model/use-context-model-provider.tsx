import * as React from 'react'
import { StrictOmit } from 'ts-essentials'

import { Model } from '@orch/model'

import { useRegisterModel, UseRegisterModelConfig } from '../hooks'
import { ContextModelProvider, ContextModelProviderProps } from './context-model-provider'

export function useContextModelProvider<M extends Model<any>>(
  ModelClass: new (...params: any) => M,
  config: UseRegisterModelConfig<M>,
) {
  const orch = useRegisterModel(ModelClass, config)

  return React.useCallback(
    (props: StrictOmit<ContextModelProviderProps, 'orch' | 'ModelClass'>) => (
      <ContextModelProvider {...props} orch={orch} ModelClass={ModelClass} />
    ),
    [orch, ModelClass],
  )
}
