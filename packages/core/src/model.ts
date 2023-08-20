import { DisposeSymbol, SetStateSymbol, SetupSymbol } from './const'
import type { DisposeFn } from './types'

export type OrchModelEventMap<S> = {
  change: (state: Readonly<S>, oldState: Readonly<S>) => void
  setup: () => void
  dispose: () => void
}

export type OrchModelEventListenerMap<State> = {
  [K in keyof OrchModelEventMap<State>]: Set<OrchModelEventMap<State>[K]>
}

export type OrchModelEventListenFnMap<State> = {
  [K in keyof OrchModelEventMap<State>]: (fn: OrchModelEventMap<State>[K]) => DisposeFn
}

export class OrchModel<State> {
  #state: State
  #isDisposed: boolean
  readonly #listeners: OrchModelEventListenerMap<State>
  readonly on: OrchModelEventListenFnMap<State>

  constructor(state: State) {
    this.#state = state
    this.#isDisposed = false
    this.#listeners = { change: new Set(), setup: new Set(), dispose: new Set() }
    this.on = _on(this.#listeners)
  }

  get isDisposed() {
    return this.#isDisposed
  }

  getState(): Readonly<State> {
    return this.#state
  }

  protected setState = this[SetStateSymbol];

  [DisposeSymbol]() {
    if (this.#isDisposed) {
      throw new Error('the model has already been disposed of.')
    }

    notify(this.#listeners.dispose)
    this.#isDisposed = true
  }

  [SetupSymbol]() {
    if (!this.#isDisposed) {
      throw new Error('the model has already been set up.')
    }

    this.#isDisposed = false
    notify(this.#listeners.setup)
  }

  [SetStateSymbol](newState: State) {
    if (this.isDisposed) {
      throw new Error('model has been disposed')
    }

    const oldState = this.getState()

    if (newState !== oldState) {
      this.#state = newState
      notify(this.#listeners.change, newState, oldState)
    }
  }
}

export function setup<M extends OrchModel<any>>(model: M) {
  if (model.isDisposed) {
    model[SetupSymbol]()
  }
}

export function dispose<M extends OrchModel<any>>(model: M) {
  if (!model.isDisposed) {
    model[DisposeSymbol]()
  }
}

function _on<State>(listeners: OrchModelEventListenerMap<State>) {
  return Object.fromEntries(
    Object.entries(listeners).map(([key, cache]) => [
      key,
      (fn: (...params: unknown[]) => void) => {
        cache.add(fn)
        return () => cache.delete(fn)
      },
    ]),
  ) as unknown as OrchModelEventListenFnMap<State>
}

function notify<P extends any[]>(fns: Set<(...params: P) => void>, ...params: P) {
  fns.forEach((fn) => fn(...params))
}
