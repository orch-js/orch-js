import { Observable, Subject } from 'rxjs'
import { tap } from 'rxjs/operators'

import { performer, Performer } from './performer'

export type SignalFactory<P, R> = (payload$: Observable<P>) => Observable<R>

export type SignalPerformer<P, R> = Performer<P> & { signal$: Observable<R> }

export function signal<P>(): SignalPerformer<P, P>

export function signal<P, R>(
  factory: SignalFactory<P, R>,
  signalSource?: Subject<P>,
): SignalPerformer<P, R>

export function signal(
  factory: SignalFactory<any, any> = (payload$) => payload$,
  signalSource: Subject<any> = new Subject(),
): SignalPerformer<any, any> {
  return Object.assign(
    performer((payload$) => factory(payload$).pipe(tap(signalSource))),
    { signal$: signalSource.asObservable() },
  )
}
