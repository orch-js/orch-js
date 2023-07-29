import { catchError, Observable, Subject, tap } from 'rxjs'

import { performer } from './performer'

export type EpicAction = null | (() => void)

export type EpicFactory<P> = (payload$: Observable<P>) => Observable<EpicAction>

export type EpicConfig = { factoryToLog?: unknown }

export type Action = {
  <P extends any[]>(func: (...params: P) => void, ...params: P): Exclude<EpicAction, null>
  curry<P extends any[]>(func: (...params: P) => void): (...params: P) => Exclude<EpicAction, null>
}

export const action: Action = Object.assign(
  function action<P extends any[]>(func: (...params: P) => void, ...params: P) {
    return () => func(...params)
  },
  {
    curry<P extends any[]>(func: (...params: P) => void) {
      return (...params: P) => {
        return () => func(...params)
      }
    },
  },
)

export function epic<P = void>(factory: EpicFactory<P>, config?: EpicConfig) {
  function init() {
    const subject = new Subject<P>()
    const subscription = factory(subject.asObservable())
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
