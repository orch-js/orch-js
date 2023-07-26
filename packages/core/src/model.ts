import { DefaultStateSymbol, ListenersSymbol, StateSymbol } from './const'
import { immutableState } from './internal-utils'

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
  [StateSymbol]: State;
  [DefaultStateSymbol]: State;
  [ListenersSymbol]: {
    [K in keyof OrchModelEventMap<State>]: Set<OrchModelEventMap<State>[K]>
  }

  constructor(defaultState: State) {
    const state = immutableState(defaultState)

    this[DefaultStateSymbol] = state
    this[StateSymbol] = state
    this[ListenersSymbol] = {
      change: new Set(),
      reset: new Set(),
    }
  }

  get state(): Readonly<State> {
    return this[StateSymbol]
  }
}
