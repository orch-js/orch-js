import * as React from 'react'
import { MarkRequired } from 'ts-essentials'

import { Model, ModelState, ModelActions } from '@orch/model'

import { useRegisterModel, UseRegisterModel } from './use-register-model'
import { useOrchState } from './use-orch-state'

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
  { selector, selectorDeps, ...registerModelConfig }: UseModelConfig<Model<any>, any> = {},
) {
  const orch = useRegisterModel(ModelClass, registerModelConfig)

  const state = useOrchState(orch.state, selector, selectorDeps)

  return [state, orch.actions]
}
