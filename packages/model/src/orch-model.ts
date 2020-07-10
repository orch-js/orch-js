import { OrchState, DeriveState } from './orch-state'

export type OrchModelConstructor<P extends any[], M extends OrchModel<any>> = {
  new (...params: P): M
}

export type OrchModelParams<T> = T extends OrchModelConstructor<infer P, any> ? P : never

export type InitiatedOrchModel<T> = T extends OrchModelConstructor<any[], infer M> ? M : never

export class OrchModel<S, D = unknown> {
  readonly state: OrchState<S, D>

  constructor(defaultState: S, deriveState?: DeriveState<S, D>) {
    this.state = new OrchState(defaultState, deriveState)
  }

  protected beforeDispose() {}
}
