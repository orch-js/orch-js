import produce from 'immer'
import { Observable, Subject, BehaviorSubject, Subscription, TeardownLogic } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'

import { Dispatcher, ReducerFunc, EffectFunc, Action } from './types'
import { dispatcherFactory, noop } from './utils'

export abstract class Model<S> {
  get state() {
    return this._state
  }

  readonly state$: Observable<Readonly<S>>

  protected readonly defaultState: Readonly<S>

  protected readonly subscription = new Subscription()

  private readonly _state$: Subject<Readonly<S>>

  private _state: Readonly<S>

  constructor(defaultState: Readonly<S>) {
    this.defaultState = produce(defaultState, () => {})
    this._state = this.defaultState

    this._state$ = new BehaviorSubject(this.defaultState)
    this.state$ = this._state$.asObservable()

    this._autoSyncState()
  }

  private _autoSyncState() {
    this.subscription.add(
      this.state$.subscribe((state) => {
        this._state = state
      }),
    )
  }

  onDispose(teardown: TeardownLogic) {
    const subscriptionId = this.subscription.add(teardown)
    return () => this.subscription.remove(subscriptionId)
  }

  dispose() {
    this.subscription.unsubscribe()
    this._state$.complete()
  }

  protected reducer<P>(callback: ReducerFunc<S, P>): Dispatcher<P> {
    return dispatcherFactory<P>((payload) => {
      // `produce` support return `Promise` and `nothing`, but `reducer` don't.
      const newState = produce(this._state, (state) => callback(state, payload)) as S
      this._state$.next(newState)
    })
  }

  protected readonly EMPTY_ACTION: Action = noop

  protected effect<P>(callback: EffectFunc<P>): Dispatcher<P> {
    const payload$ = new Subject<P>()

    this.subscription.add(
      callback(payload$.asObservable())
        .pipe(
          tap((action) => action()),
          catchError((err, caught$) => {
            console.error(err, callback)
            return caught$
          }),
        )
        .subscribe(),
    )

    return dispatcherFactory<P>((payload) => {
      payload$.next(payload)
    })
  }
}
