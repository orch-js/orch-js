import { BehaviorSubject, Observable, Subscription } from 'rxjs'

export type OrchStateConfig<S> = {
  defaultState: S
}

export class OrchState<S> {
  get isDisposed() {
    return this.subscription.closed
  }

  readonly state$: Observable<S>

  private readonly subscription: Subscription

  private readonly stateSource: BehaviorSubject<S>

  constructor({ defaultState }: OrchStateConfig<S>) {
    this.subscription = new Subscription()
    this.stateSource = new BehaviorSubject<S>(defaultState)
    this.state$ = this.stateSource.asObservable()
  }

  getState(): Readonly<S> {
    return this.stateSource.value
  }

  setState(newState: S) {
    if (!this.isDisposed) {
      this.stateSource.next(newState)
    }
  }

  onDispose(callback: () => void) {
    this.subscription.add(callback)
  }

  dispose() {
    this.subscription.unsubscribe()
    this.stateSource.complete()
  }
}
