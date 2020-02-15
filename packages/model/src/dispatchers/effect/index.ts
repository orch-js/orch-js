import { Observable } from 'rxjs'
import { tap, filter } from 'rxjs/operators'

import { Model } from '../../model'
import { Action } from '../../types'
import { dispatcherFactory, action, isAction } from '../utils'

export type EffectFunc<P> = (payload$: Observable<P>) => Observable<Action>

export const EMPTY_ACTION: Action = action(() => {})

export function effect<S>(model: Model<S>) {
  return <P>(effect: EffectFunc<P>) => {
    return dispatcherFactory<S, P>(model, ({ payload$ }) =>
      effect(payload$).pipe(
        filter(isAction),
        tap((action) => action()),
      ),
    )
  }
}
