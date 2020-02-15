import { Subject } from 'rxjs'
import { catchError, tap, filter } from 'rxjs/operators'

import { Model } from '../model'
import { Action, EffectFunc, Dispatcher } from './types'
import { dispatcherFactory, action, isAction } from './utils'

export const EMPTY_ACTION: Action = action(() => {})

export function effect<S>(model: Model<S>) {
  return <P>(effect: EffectFunc<P>): Dispatcher<P> => {
    const payload$ = new Subject<P>()

    const subscription = effect(payload$.asObservable())
      .pipe(
        filter(isAction),
        tap((action) => action()),
        catchError((err, caught$) => {
          console.error(err, effect)
          return caught$
        }),
      )
      .subscribe()

    model.onModelDispose(() => subscription.unsubscribe())

    return dispatcherFactory((payload: P) => {
      payload$.next(payload)
    })
  }
}
