import { ActivateSymbol, DeactivateSymbol, SetStateSymbol } from './const'
import type { DisposeFn } from './types'

export type OrchModelEventMap<S> = {
  change: (state: Readonly<S>, oldState: Readonly<S>) => void
  activate: () => void
  deactivate: () => void
}

export type OrchModelEventListenerMap<State> = {
  [K in keyof OrchModelEventMap<State>]: Set<OrchModelEventMap<State>[K]>
}

export type OrchModelEventListenFnMap<State> = {
  [K in keyof OrchModelEventMap<State>]: (fn: OrchModelEventMap<State>[K]) => DisposeFn
}

export type OrchModelStatus = 'initialized' | 'active' | 'inactive'

export class OrchModel<State> {
  #state: State
  #status: OrchModelStatus
  readonly #listeners: OrchModelEventListenerMap<State>
  readonly on: OrchModelEventListenFnMap<State>

  constructor(state: State) {
    this.#state = state
    this.#status = 'initialized'
    this.#listeners = { change: new Set(), activate: new Set(), deactivate: new Set() }
    this.on = _on(this.#listeners, {
      change: () => {
        if (this.status !== 'active') {
          console.warn(
            `${this.constructor.name} is in "${this.status}" status, it won't be able to emit "change" event.`,
          )
        }
      },
    })
  }

  get status() {
    return this.#status
  }

  getState(): Readonly<State> {
    return this.#state
  }

  protected setState = this[SetStateSymbol];

  [DeactivateSymbol]() {
    if (this.status === 'inactive') {
      throw new Error('the model is already inactive.')
    }

    notify(this.#listeners.deactivate)
    this.#status = 'inactive'
  }

  [ActivateSymbol]() {
    if (this.status === 'active') {
      throw new Error('the model is already active.')
    }

    this.#status = 'active'
    notify(this.#listeners.activate)
  }

  [SetStateSymbol](newState: State) {
    if (this.status === 'inactive') {
      throw new Error(`Unable to update state, since the model is in "${this.status}" status`)
    }

    const oldState = this.getState()

    if (newState !== oldState) {
      this.#state = newState
      notify(this.#listeners.change, newState, oldState)
    }
  }
}

export function activate<M extends OrchModel<any>>(model: M) {
  if (model.status !== 'active') {
    model[ActivateSymbol]()
  }
}

export function deactivate<M extends OrchModel<any>>(model: M) {
  if (model.status !== 'inactive') {
    model[DeactivateSymbol]()
  }
}

type OnSubscribeMap<State> = Partial<Record<keyof OrchModelEventMap<State>, () => void>>

function _on<State>(
  listeners: OrchModelEventListenerMap<State>,
  onSubscribe: OnSubscribeMap<State>,
) {
  return Object.fromEntries(
    Object.entries(listeners).map(([key, cache]) => [
      key,
      (fn: (...params: unknown[]) => void) => {
        onSubscribe[key as keyof OrchModelEventMap<State>]?.()
        cache.add(fn)
        return () => cache.delete(fn)
      },
    ]),
  ) as unknown as OrchModelEventListenFnMap<State>
}

function notify<P extends any[]>(fns: Set<(...params: P) => void>, ...params: P) {
  fns.forEach((fn) => fn(...params))
}
