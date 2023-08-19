import { SetStateSymbol } from './const'
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
  readonly #defaultState: State
  readonly #listeners: { [K in keyof OrchModelEventMap<State>]: Set<OrchModelEventMap<State>[K]> }

  constructor(state: State, defaultState = state) {
    this.#state = state
    this.#defaultState = defaultState
    this.#listeners = { change: new Set(), reset: new Set() }
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

  protected setState = this[SetStateSymbol];

  [SetStateSymbol](newState: State) {
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
