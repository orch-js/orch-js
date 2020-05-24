import { BehaviorSubject, Observable } from 'rxjs'

export class OrchState<S> {
  readonly state$: Observable<S>

  private readonly stateSource: BehaviorSubject<S>

  get isDisposed() {
    return this.stateSource.isStopped
  }

  constructor(defaultState: S) {
    this.stateSource = new BehaviorSubject<S>(defaultState)
    this.state$ = this.stateSource.asObservable()
  }

  getState() {
    return this.stateSource.value
  }

  setState(newState: S) {
    if (this.isDisposed) {
      return
    }

    this.stateSource.next(newState)
  }

  dispose() {
    this.stateSource.complete()
  }
}
