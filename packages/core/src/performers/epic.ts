import { catchError, map, Observable, OperatorFunction, Subject, tap } from 'rxjs'

import { performer } from './performer'

export type ValidEpicAction = null | (() => void)

export type EpicFactory<P> = (
  payload$: Observable<P>,
  options: { action: EpicAction },
) => Observable<ValidEpicAction>

export type EpicConfig = { factoryToLog?: unknown }

export type EpicAction = {
  <P extends any[]>(func: (...params: P) => void, ...params: P): Exclude<ValidEpicAction, null>

  map<P>(func: (payload: P) => void): OperatorFunction<P, ValidEpicAction>
}

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

export function epic<P = void>(factory: EpicFactory<P>, config?: EpicConfig) {
  function init() {
    const subject = new Subject<P>()
    const subscription = factory(subject.asObservable(), { action })
      .pipe(
        tap((epicAction) => epicAction?.()),
        logAngIgnoreError(config?.factoryToLog ?? factory),
      )
      .subscribe()

    return { subject, subscription }
  }

  return performer<P, void>(() => {
    let current = init()

    return {
      next(payload) {
        current.subject.next(payload)
      },
      reset() {
        current.subject.complete()
        current.subscription.unsubscribe()
        current = init()
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
