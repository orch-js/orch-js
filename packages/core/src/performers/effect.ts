import { catchError, Observable, Subject, tap } from 'rxjs'

import { performer } from './performer'

export type EffectAction = null | (() => void)

export type EffectFactory<P> = (payload$: Observable<P>) => Observable<EffectAction>

export type EffectConfig = { factoryToLog?: unknown }

export type Action = {
  <P extends any[]>(func: (...params: P) => void, ...params: P): Exclude<EffectAction, null>
  curry<P extends any[]>(
    func: (...params: P) => void,
  ): (...params: P) => Exclude<EffectAction, null>
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

export function effect<P = void>(factory: EffectFactory<P>, config?: EffectConfig) {
  function init() {
    const subject = new Subject<P>()
    const subscription = factory(subject.asObservable())
      .pipe(
        tap((effectAction) => {
          effectAction?.()
        }),
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
    console.group('[Orch]: Effect error')
    console.log(factory)
    console.error(err)
    console.groupEnd()
    /* eslint-enable no-console */
    return caught
  })
}
