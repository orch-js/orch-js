import { Observable, Subject } from 'rxjs'

import { PayloadFunc } from '@orch/utility-types'

import { DisposeSymbol } from '../const'

export type Performer<P> = PayloadFunc<P, void> & {
  [DisposeSymbol]: () => void
}

export type PerformerFactory<P> = (payload$: Observable<P>) => Observable<any>

export function performer<P>(factory: PerformerFactory<P>): Performer<P> {
  const payloadSource = new Subject<P>()
  const subscription = factory(payloadSource).subscribe()

  return Object.assign(
    function trigger(payload: P) {
      payloadSource.next(payload)
    } as PayloadFunc<P, void>,

    {
      [DisposeSymbol]() {
        payloadSource.complete()
        subscription.unsubscribe()
      },
    },
  )
}

export function isPerformer(obj: any): obj is Performer<any> {
  return obj && typeof obj === 'function' && typeof obj[DisposeSymbol] === 'function'
}

export function disposePerformer(performer: Performer<any>) {
  performer[DisposeSymbol]()
}
