import produce from 'immer'
import { Observable, BehaviorSubject, Subscription, TeardownLogic } from 'rxjs'

import { StateSourceSymbol } from './symbols'

export abstract class Model<S> {
  get state() {
    return this[StateSourceSymbol].value
  }

  get isDisposed() {
    return this.subscription.closed
  }

  readonly state$: Observable<Readonly<S>>;

  readonly [StateSourceSymbol]: BehaviorSubject<Readonly<S>>

  protected readonly subscription = new Subscription()

  constructor(defaultState: Readonly<S>) {
    const readonlyState = produce(defaultState, () => {})

    this[StateSourceSymbol] = new BehaviorSubject(readonlyState)
    this.state$ = this[StateSourceSymbol].asObservable()
  }

  onDispose(teardown: TeardownLogic) {
    const subscriptionId = this.subscription.add(teardown)
    return () => this.subscription.remove(subscriptionId)
  }

  dispose() {
    this.subscription.unsubscribe()
    this[StateSourceSymbol].complete()
  }
}
