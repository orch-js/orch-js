import * as React from 'react'
import { MarkRequired } from 'ts-essentials'

import { Model, ModelState, ModelActions, ModelConfig } from '@orch/model'

import { UseRegisterModel } from './use-register-model'
import { useModelInstance } from './use-model-instance'

type UseModelConfig<M extends Model<any>, S> = UseRegisterModel<M> & {
  selector?: (state: ModelState<M>) => S
  selectorDeps?: React.DependencyList
}

export function useModel<M extends Model<any>, S>(
  ModelClass: new (...params: any) => M,
  config: MarkRequired<UseModelConfig<M, S>, 'selector'>,
): [S, ModelActions<M>]

export function useModel<M extends Model<any>>(
  ModelClass: new (...params: any) => M,
  config?: UseRegisterModel<M>,
): [ModelState<M>, ModelActions<M>]

export function useModel(
  ModelClass: new (...params: any) => Model<any>,
  config: UseModelConfig<Model<any>, any> = {},
) {
  const model = React.useMemo(() => ModelConfig.resolveModel(ModelClass), [ModelClass])
  return useModelInstance(model, config)
}
