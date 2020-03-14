import { NEVER, Observable, Subject } from 'rxjs'
import { switchMapTo, filter, map, tap } from 'rxjs/operators'

import { Performer, PerformerFactoryMeta } from '@orch/store'

export class SignalPerformer<P> extends Performer<P, any> {
  private signalSource = new Subject<{ meta: PerformerFactoryMeta; payload: P }>()

  signal$(meta: PerformerFactoryMeta): Observable<P> {
    return this.signalSource.pipe(
      filter((signal) => Performer.isIdenticalMeta(signal.meta, meta)),
      map(({ payload }) => payload),
    )
  }

  constructor() {
    super((payload$, _, meta) =>
      payload$.pipe(
        map((payload) => ({ meta, payload })),
        tap(this.signalSource),
        switchMapTo(NEVER),
      ),
    )
  }
}

export function signal<P = void>() {
  return new SignalPerformer<P>()
}
