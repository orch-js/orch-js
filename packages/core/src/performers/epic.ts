import { catchError, map, Observable, Subject, tap, type OperatorFunction } from 'rxjs'

import type { OrchModel } from '../model'
import { performer } from './performer'

export type ValidEpicAction = null | (() => void)

export type EpicFactory<P> = (params: {
  payload$: Observable<P>
  action: EpicAction
  state$: ToObservableState
}) => Observable<ValidEpicAction>

export type EpicConfig = { factoryToLog?: unknown }

export type EpicAction = {
  <P extends any[]>(func: (...params: P) => void, ...params: P): Exclude<ValidEpicAction, null>

  map<P>(func: (payload: P) => void): OperatorFunction<P, ValidEpicAction>
}

export type ToObservableState = <S>(model: OrchModel<S>) => Observable<S>

const action: EpicAction = Object.assign(
  function action<P extends any[]>(func: (...params: P) => void, ...params: P) {
    return () => func(...params)
  },
  {
    map<P>(func: (payload: P) => void): OperatorFunction<P, ValidEpicAction> {
      return map((value) => action(func, value))
    },
  },
)

const state$: ToObservableState = (model) => {
  return new Observable((observer) => {
    observer.next(model.getState())

    return model.on.change(() => {
      observer.next(model.getState())
    })
  })
}

export function epic<P = void>(
  model: OrchModel<any>,
  factory: EpicFactory<P>,
  config?: EpicConfig,
) {
  function init() {
    const subject = new Subject<P>()
    const subscription = factory({ payload$: subject.asObservable(), action, state$ })
      .pipe(
        tap((epicAction) => epicAction?.()),
        logAngIgnoreError(config?.factoryToLog ?? factory),
      )
      .subscribe()

    return { subject, subscription }
  }

  return performer<P, void>(model, () => {
    const { subject, subscription } = init()

    return {
      next(payload) {
        subject.next(payload)
      },
      dispose() {
        subject.complete()
        subscription.unsubscribe()
      },
    }
  })
}

function logAngIgnoreError(factory: unknown) {
  return catchError((err, caught) => {
    /* eslint-disable no-console */
    console.group('[Orch]: Epic error')
    console.log(factory)
    console.error(err)
    console.groupEnd()
    /* eslint-enable no-console */
    return caught
  })
}
