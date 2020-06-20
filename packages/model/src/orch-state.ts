import { BehaviorSubject, Observable } from 'rxjs'
import produce from 'immer'

const immutableState = <T>(state: T): T => produce(state, () => {})

export class OrchState<S> {
  readonly state$: Observable<S>

  private readonly stateSource: BehaviorSubject<S>

  get isDisposed() {
    return this.stateSource.isStopped
  }

  constructor(defaultState: S) {
    this.stateSource = new BehaviorSubject<S>(immutableState(defaultState))
    this.state$ = this.stateSource.asObservable()
  }

  getState() {
    return this.stateSource.value
  }

  setState(newState: S) {
    if (this.isDisposed) {
      return
    }

    this.stateSource.next(immutableState(newState))
  }

  dispose() {
    this.stateSource.complete()
  }
}
