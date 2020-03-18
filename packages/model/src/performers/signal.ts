import { NEVER, Observable, Subject } from 'rxjs'
import { switchMapTo, filter, map, tap } from 'rxjs/operators'

import { Performer, PerformerFactoryMeta } from '@orch/store'

type SignalWrapper<P, R> = (payload$: Observable<P>) => Observable<R>

type SignalOriginPayload<P> = { meta: PerformerFactoryMeta; payload: P }

export class SignalPerformer<P, R = P> extends Performer<P, unknown> {
  private readonly signalSource = new Subject<SignalOriginPayload<P>>()

  constructor(private readonly signalWrapper: SignalWrapper<P, R>) {
    super(({ payload$, meta }) =>
      payload$.pipe(
        map((payload) => ({ meta, payload })),
        tap(this.signalSource),
        switchMapTo(NEVER),
      ),
    )
  }

  signal$(meta: PerformerFactoryMeta): Observable<R> {
    return this.signalWrapper(
      this.signalSource.pipe(
        filter((signal) => Performer.isIdenticalMeta(signal.meta, meta)),
        map(({ payload }) => payload),
      ),
    )
  }
}

const defaultWrapper: SignalWrapper<any, any> = (payload$) => payload$

export function signal<P = void, R = P>(signalWrapper: SignalWrapper<P, R> = defaultWrapper) {
  return new SignalPerformer<P, R>(signalWrapper)
}
