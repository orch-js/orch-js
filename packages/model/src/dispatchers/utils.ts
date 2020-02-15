import { Observable, Subject } from 'rxjs'
import { skipUntil, take, catchError } from 'rxjs/operators'

import { Model } from '@orch/model'

import { ActionSymbol, StateSourceSymbol } from '../symbols'
import { Action, Dispatcher } from './types'

export interface DispatcherFactoryConfig<S, P> {
  state$: Observable<S>
  payload$: Observable<P>
  setState: (newState: S) => void
}

export function funcToDispatcher<P>(dispatcher: (payload: P) => void): Dispatcher<P>
export function funcToDispatcher(dispatcher: (payload: any) => void): Dispatcher<any> {
  return Object.assign(dispatcher, {
    asAction(payload: any): Action {
      return action(() => dispatcher(payload))
    },
  })
}

export function dispatcherFactory<S, P>(
  model: Model<S>,
  factory: (config: DispatcherFactoryConfig<S, P>) => Observable<any>,
): Dispatcher<P> {
  const state$ = model.state$
  const onModelActivated$ = state$.pipe(take(1))

  const payloadSource = new Subject<P>()
  const payload$ = payloadSource.asObservable().pipe(skipUntil(onModelActivated$))

  const setState = (newState: S) => model[StateSourceSymbol].next(newState)

  const subscription = factory({ payload$, state$, setState })
    .pipe(
      catchError((err, caught$) => {
        console.error(err)
        return caught$
      }),
    )
    .subscribe()

  model.onModelDispose(() => {
    payloadSource.complete()
    subscription.unsubscribe()
  })

  return funcToDispatcher<P>((payload) => {
    payloadSource.next(payload)
  })
}

export function action(callback: () => void): Action {
  return Object.assign(callback, {
    identify: ActionSymbol,
  } as const)
}

export function isAction(action: any): boolean {
  return typeof action === 'function' && action.identify === ActionSymbol
}
