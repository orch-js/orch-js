import { Model, ModelState, ModelActions } from '@orch/model'
import { MarkRequired } from 'ts-essentials'

import { useRegisterModel, UseRegisterModel } from './use-register-model'
import { useOrchState } from './use-orch-state'
import * as React from 'react'

export type UseModelInstanceConfig<M extends Model<any>, S> = UseRegisterModel<M> & {
  selector?: (state: ModelState<M>) => S
  selectorDeps?: React.DependencyList
}

export function useModelInstance<M extends Model<any>, S>(
  model: M,
  config: MarkRequired<UseModelInstanceConfig<M, S>, 'selector'>,
): [S, ModelActions<M>]

export function useModelInstance<M extends Model<any>>(
  model: M,
  config?: UseRegisterModel<M>,
): [ModelState<M>, ModelActions<M>]

export function useModelInstance(
  model: Model<any>,
  { selector, selectorDeps, ...registerModelConfig }: UseModelInstanceConfig<Model<any>, any> = {},
) {
  const orch = useRegisterModel(model, registerModelConfig)
  const state = useOrchState(orch, selector, selectorDeps)

  return [state, orch.actions]
}
