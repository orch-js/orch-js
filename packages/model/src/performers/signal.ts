import { NEVER, Observable, Subject } from 'rxjs'
import { switchMapTo, filter, map, tap } from 'rxjs/operators'

import { Performer, CaseId } from '@orch/store'

export class SignalPerformer<P> extends Performer<P, any> {
  private signalSource = new Subject<{ caseId: string; payload: P }>()

  signal$(caseId: CaseId): Observable<P> {
    return this.signalSource.pipe(
      filter((signal) => signal.caseId === caseId),
      map(({ payload }) => payload),
    )
  }

  constructor() {
    super((payload$, _, { caseId }) =>
      payload$.pipe(
        map((payload) => ({ caseId, payload })),
        tap(this.signalSource),
        switchMapTo(NEVER),
      ),
    )
  }
}

export function signal<P = void>() {
  return new SignalPerformer<P>()
}
