import * as React from 'react'
import { MarkRequired } from 'ts-essentials'

import { Model, ModelState, ModelActions } from '@orch/model'

import { useOrchState } from '../hooks'
import { useContextModelValue } from './use-context-model-value'

type UseContextModelConfig<M extends Model<any>, S> = {
  selector?: (state: ModelState<M>) => S
  selectorDeps?: React.DependencyList
}

export function useContextModel<M extends Model<any>, S>(
  ModelClass: new (...params: any) => M,
  config: MarkRequired<UseContextModelConfig<M, S>, 'selector'>,
): [S, ModelActions<M>]

export function useContextModel<M extends Model<any>, S>(
  ModelClass: new (...params: any) => M,
  config?: UseContextModelConfig<M, S>,
): [ModelState<M>, ModelActions<M>]

export function useContextModel(
  ModelClass: new (...params: any) => Model<any>,
  { selector, selectorDeps }: UseContextModelConfig<Model<any>, any> = {},
) {
  const orch = useContextModelValue(ModelClass)
  const state = useOrchState(orch, selector, selectorDeps)

  return [state, orch.actions]
}
