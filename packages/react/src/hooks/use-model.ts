import * as React from 'react'
import { MarkRequired } from 'ts-essentials'

import { OrchModel, ModelState, ModelActions } from '@orch/model'

import { useRegisterModel, UseRegisterModelConfig } from './use-register-model'
import { useOrchState } from './use-orch-state'

type UseModelConfig<M extends OrchModel<any>, S> = UseRegisterModelConfig<M> & {
  selector?: (state: ModelState<M>) => S
  selectorDeps?: React.DependencyList
}

export function useModel<M extends OrchModel<any>, S>(
  ModelClass: new (...params: any) => M,
  config: MarkRequired<UseModelConfig<M, S>, 'selector'>,
): [S, ModelActions<M>]

export function useModel<M extends OrchModel<any>>(
  ModelClass: new (...params: any) => M,
  config?: UseRegisterModelConfig<M>,
): [ModelState<M>, ModelActions<M>]

export function useModel(
  ModelClass: new (...params: any) => OrchModel<any>,
  { selector, selectorDeps, ...registerModelConfig }: UseModelConfig<OrchModel<any>, any> = {},
) {
  const orch = useRegisterModel(ModelClass, registerModelConfig)

  const state = useOrchState(orch, selector, selectorDeps)

  return [state, orch.actions]
}
