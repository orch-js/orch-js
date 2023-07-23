import { Observable, Subject } from 'rxjs'
import { catchError } from 'rxjs/operators'

import { DisposeSymbol } from '../const'
import { PayloadFunc } from '../utility-types'

export type Performer<P> = PayloadFunc<P, void> & {
  [DisposeSymbol]: () => void
}

export type PerformerFactory<P> = (payload$: Observable<P>) => Observable<any>

export type PerformerConfig = {
  factoryToLog?: unknown
}

export function performer<P>(factory: PerformerFactory<P>, config?: PerformerConfig): Performer<P> {
  const payloadSource = new Subject<P>()
  const subscription = factory(payloadSource)
    .pipe(logAngIgnoreError(config?.factoryToLog ?? factory))
    .subscribe()

  return Object.assign(
    function trigger(payload: P) {
      if (payloadSource.isStopped) {
        throw new Error('current performer is disposed')
      } else {
        payloadSource.next(payload)
      }
    } as PayloadFunc<P, void>,

    {
      [DisposeSymbol]() {
        payloadSource.complete()
        subscription.unsubscribe()
      },
    },
  )
}

function logAngIgnoreError(factory: unknown) {
  return catchError((err, caught) => {
    /* eslint-disable no-console */
    console.group('[Orch]: Performer error')
    console.log(factory)
    console.error(err)
    console.groupEnd()
    /* eslint-enable no-console */
    return caught
  })
}

export function isPerformer(obj: any): obj is Performer<any> {
  return obj && typeof obj === 'function' && typeof obj[DisposeSymbol] === 'function'
}

export function disposePerformer(performer: Performer<any>) {
  performer[DisposeSymbol]()
}
