import { produce } from 'immer'
import { BehaviorSubject, Observable } from 'rxjs'

import { SetStateSymbol } from './const'

export type DeriveState<S, D = unknown> = (state: S & Partial<D>) => S & D

export class OrchState<S, D = unknown> {
  readonly state$: Observable<S & D>

  private readonly stateSource: BehaviorSubject<S & D>

  get isDisposed() {
    return this.stateSource.isStopped
  }

  constructor(
    defaultState: S,
    private readonly deriveState?: DeriveState<S, D>,
  ) {
    this.stateSource = new BehaviorSubject(getDerivedState(defaultState, this.deriveState))
    this.state$ = this.stateSource.asObservable()
  }

  getState() {
    return this.stateSource.value
  }

  [SetStateSymbol](newState: S) {
    if (this.isDisposed) {
      throw new Error('current state is disposed')
    }

    this.stateSource.next(getDerivedState(newState, this.deriveState))
  }

  dispose() {
    this.stateSource.complete()
  }
}

function immutableState<T>(state: T): T {
  return produce(state, () => {})
}

function getDerivedState<S, D>(state: S, deriveState?: DeriveState<S, D>): S & D
function getDerivedState(state: any, deriveState?: DeriveState<any, any>): any {
  const newState = immutableState(state)

  if (deriveState) {
    return deriveState(newState)
  } else {
    return newState
  }
}
