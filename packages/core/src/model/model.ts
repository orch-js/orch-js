import { produce, type Draft } from 'immer'

type OrchModelEventMap<S> = {
  change: (state: Readonly<S>, oldState: Readonly<S>) => void
  dispose: () => void
}

type Mutation<S> = (state: Draft<S>) => undefined | void | Draft<S>

type Callbacks<S> = {
  [K in keyof OrchModelEventMap<S>]: Set<OrchModelEventMap<S>[K]>
}

export class OrchModel<State> {
  #state: State

  #isDisposed = false

  #callbacks: Callbacks<State> = { change: new Set(), dispose: new Set() }

  constructor(defaultState: State) {
    this.#state = immutableState(defaultState)
  }

  get state(): Readonly<State> {
    return this.#state
  }

  get isDisposed() {
    return this.#isDisposed
  }

  dispose() {
    this.#isDisposed = true

    this.#callbacks.dispose.forEach((cb) => cb())

    this.#callbacks.dispose.clear()
    this.#callbacks.change.clear()
  }

  setState(mutationOrState: State | Mutation<State>) {
    if (this.isDisposed) {
      throw new Error('current state is disposed')
    }

    const newState = isMutation<State>(mutationOrState)
      ? produce(this.#state, mutationOrState)
      : immutableState(mutationOrState)

    if (newState !== this.#state) {
      const oldState = this.#state
      this.#state = newState
      this.#callbacks.change.forEach((cb) => cb(newState, oldState))
    }
  }

  onChange = (fn: OrchModelEventMap<State>['change']) => {
    this.#callbacks.change.add(fn)
    return () => this.#callbacks.change.delete(fn)
  }

  onDispose = (fn: OrchModelEventMap<State>['dispose']) => {
    this.#callbacks.dispose.add(fn)
    return () => this.#callbacks.dispose.delete(fn)
  }
}

function immutableState<T>(state: T): T {
  return produce(state, () => {})
}

function isMutation<S>(mutation: unknown): mutation is Mutation<S> {
  return typeof mutation === 'function'
}
