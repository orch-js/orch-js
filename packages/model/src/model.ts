import produce from 'immer'
import { Observable, BehaviorSubject, Subscription, TeardownLogic } from 'rxjs'

import { reducerFactory, effectFactory, EMPTY_ACTION } from './dispatchers'

export abstract class Model<S> {
  get state() {
    return this.stateSource.value
  }

  get isDisposed() {
    return this.subscription.closed
  }

  readonly state$: Observable<Readonly<S>>

  private readonly stateSource: BehaviorSubject<Readonly<S>>

  protected readonly defaultState: Readonly<S>

  protected readonly subscription = new Subscription()

  constructor(defaultState: Readonly<S>) {
    this.defaultState = produce(defaultState, () => {})
    this.stateSource = new BehaviorSubject(this.defaultState)
    this.state$ = this.stateSource.asObservable()
  }

  onDispose(teardown: TeardownLogic) {
    const subscriptionId = this.subscription.add(teardown)
    return () => this.subscription.remove(subscriptionId)
  }

  dispose() {
    this.subscription.unsubscribe()
    this.stateSource.complete()
  }

  protected readonly reducer = reducerFactory({
    getState: () => this.state,
    onStateUpdate: (newState) => {
      if (!this.isDisposed) {
        this.stateSource.next(newState)
      }
    },
  })

  protected readonly effect = effectFactory({
    subscription: this.subscription,
  })

  protected readonly EMPTY_ACTION = EMPTY_ACTION
}
