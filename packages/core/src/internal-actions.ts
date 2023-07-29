import { produce, type Draft } from 'immer'

import { DefaultStateSymbol, ListenersSymbol, StateSymbol } from './const'
import { immutableState } from './internal-utils'
import { OrchModel, OrchModelEventMap, OrchModelState } from './model'
import { isPerformer, Performer, resetPerformer } from './performers/performer'

type Mutation<S> = (state: Draft<S>) => undefined | void | Draft<S>

export function setState<M extends OrchModel<any>>(
  model: M,
  mutationOrState: OrchModelState<M> | Mutation<OrchModelState<M>>,
) {
  const newState = (
    isMutation(mutationOrState)
      ? produce(model[DefaultStateSymbol], mutationOrState)
      : immutableState(mutationOrState)
  ) as OrchModelState<M>

  setStateAndNotify(model, newState)
}

export function subscribe<M extends OrchModel<any>, K extends keyof OrchModelEventMap<any>>(
  key: K,
  model: M,
  fn: OrchModelEventMap<OrchModelState<M>>[K],
) {
  model[ListenersSymbol][key].add(fn)
  return () => model[ListenersSymbol][key].delete(fn)
}

export function reset<M extends OrchModel<any>>(model: M) {
  model[ListenersSymbol].reset.forEach((cb) => cb())
  getAllPerformers(model).forEach(resetPerformer)
  setStateAndNotify(model, model[DefaultStateSymbol])
}

// --- Helpers ---

function setStateAndNotify<M extends OrchModel<any>>(model: M, newState: OrchModelState<M>) {
  if (newState !== model.state) {
    const oldState = model.state
    model[StateSymbol] = newState
    model[ListenersSymbol].change.forEach((cb) => cb(newState, oldState))
  }
}

function isMutation<S>(mutation: unknown): mutation is Mutation<S> {
  return typeof mutation === 'function'
}

function getAllPerformers(model: OrchModel<unknown>) {
  const performers: Performer<unknown, unknown>[] = []

  Object.keys(model).forEach((key) => {
    const value = (model as any)[key]

    if (isPerformer(value)) {
      performers.push(value)
    }
  })

  return performers
}
