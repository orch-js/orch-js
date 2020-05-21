import { BehaviorSubject, Observable } from 'rxjs'

export class OrchState<S> {
  readonly state$: Observable<S>

  readonly getState: () => S

  readonly setState: (newState: S) => void

  constructor(defaultState: S) {
    const stateSource = new BehaviorSubject<S>(defaultState)

    this.state$ = stateSource.asObservable()
    this.getState = () => stateSource.value
    this.setState = (newState) => stateSource.next(newState)
  }
}
