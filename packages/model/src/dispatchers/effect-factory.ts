import { Subject, Subscription } from 'rxjs'
import { catchError, tap, filter } from 'rxjs/operators'

import { Action, EffectFunc, Dispatcher } from './types'
import { dispatcher, action, isAction } from './utils'

export const EMPTY_ACTION: Action = action(() => {})

export function effectFactory({ subscription }: { subscription: Subscription }) {
  return <P>(effect: EffectFunc<P>): Dispatcher<P> => {
    const payload$ = new Subject<P>()

    subscription.add(
      effect(payload$.asObservable())
        .pipe(
          filter(isAction),
          tap((action) => action()),
          catchError((err, caught$) => {
            console.error(err, effect)
            return caught$
          }),
        )
        .subscribe(),
    )

    return dispatcher<P>((payload) => {
      payload$.next(payload)
    })
  }
}
