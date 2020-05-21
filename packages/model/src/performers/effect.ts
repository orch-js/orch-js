import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

import { Performer, performer } from './performer'

export type EffectAction = null | (() => void)

export type EffectFactoryParam<P, S> = { payload$: Observable<P>; state$: Observable<S> }

export type EffectFactory<P, S> = (param: EffectFactoryParam<P, S>) => Observable<EffectAction>

export function action<P extends any[]>(func: (...params: P) => void, ...params: P): EffectAction {
  return () => func(...params)
}

export function effect<P = void, S = unknown>(factory: EffectFactory<P, S>): Performer<P, S> {
  return performer(({ payload$, orchState }) =>
    factory({ payload$, state$: orchState.state$ }).pipe(
      tap((effectAction) => {
        effectAction?.()
      }),
    ),
  )
}
