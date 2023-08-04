import { Draft, produce } from 'immer'

import { isPerformer, Performer, resetPerformer } from './performers/performer'

export type OrchModelConstructor<P extends any[], M extends OrchModel<any>> = {
  new (...params: P): M
}

export type OrchModelState<M extends OrchModel<any>> = M extends OrchModel<infer S> ? S : never

export type OrchModelParams<T> = T extends OrchModelConstructor<infer P, any> ? P : never

export type InitiatedOrchModel<T> = T extends OrchModelConstructor<any[], infer M> ? M : never

export type OrchModelEventMap<S> = {
  change: (state: Readonly<S>, oldState: Readonly<S>) => void
  reset: () => void
}

export class OrchModel<State> {
  #state: State
  #defaultState: State
  #listeners: { [K in keyof OrchModelEventMap<State>]: Set<OrchModelEventMap<State>[K]> }

  constructor(defaultState: State) {
    const state = immutableState(defaultState)

    this.#defaultState = state
    this.#state = state
    this.#listeners = {
      change: new Set(),
      reset: new Set(),
    }
  }

  getState(): Readonly<State> {
    return this.#state
  }

  on<K extends keyof OrchModelEventMap<any>>(key: K, fn: OrchModelEventMap<State>[K]) {
    this.#listeners[key].add(fn)
    return () => this.#listeners[key].delete(fn)
  }

  reset() {
    this.#listeners.reset.forEach((cb) => cb())
    getAllPerformers(this).forEach(resetPerformer)
    this.setState(this.#defaultState)
  }

  protected reducer<P extends any[]>(
    fn: (state: Draft<State>, ...payload: P) => Draft<State> | void,
  ) {
    return (...payload: P) => {
      this.setState(produce(this.#state, (state) => fn(state, ...payload)))
    }
  }

  protected setState(newState: State) {
    const oldState = this.getState()

    if (newState !== oldState) {
      this.#state = newState
      this.#listeners.change.forEach((cb) => cb(newState, oldState))
    }
  }
}

function getAllPerformers(model: OrchModel<any>) {
  const performers: Performer<unknown, unknown>[] = []

  Object.keys(model).forEach((key) => {
    const value = (model as any)[key]

    if (isPerformer(value)) {
      performers.push(value)
    }
  })

  return performers
}

function immutableState<T>(state: T): T {
  return produce(state, () => {})
}
