import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

import { Performer, performer } from './performer'

export type EffectAction = null | (() => void)

export type EffectFactory<P> = (payload$: Observable<P>) => Observable<EffectAction>

export function action<P extends any[]>(func: (...params: P) => void, ...params: P): EffectAction {
  return () => func(...params)
}

export function effect<P = void>(factory: EffectFactory<P>): Performer<P> {
  return performer((payload$) =>
    factory(payload$).pipe(
      tap((effectAction) => {
        effectAction?.()
      }),
    ),
  )
}
