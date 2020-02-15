import produce from 'immer'
import { Subject, Subscription, TeardownLogic } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'

import { StateSourceSymbol } from './symbols'

function readonlyState<S>(newState: S): Readonly<S> {
  return produce(newState, () => {})
}

export abstract class Model<S> {
  abstract readonly defaultState: S

  get isActivated() {
    return this._isActivated
  }

  get isDisposed() {
    return this.subscription.closed
  }

  readonly [StateSourceSymbol] = new Subject<S>()

  readonly state$ = this[StateSourceSymbol].asObservable().pipe(map(readonlyState), shareReplay(1))

  protected readonly subscription = new Subscription()

  private _isActivated = false

  constructor() {
    this.state$.subscribe()
  }

  activateModel(defaultState: S = this.defaultState) {
    if (!this._isActivated) {
      this._isActivated = true
      this[StateSourceSymbol].next(defaultState)
    }
  }

  onModelDispose(teardown: TeardownLogic) {
    const subscriptionId = this.subscription.add(teardown)
    return () => this.subscription.remove(subscriptionId)
  }

  disposeModel() {
    this.subscription.unsubscribe()
    this[StateSourceSymbol].complete()
  }
}
