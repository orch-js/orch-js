import { Observable, Subject } from 'rxjs'
import { tap } from 'rxjs/operators'

import { performer, Performer } from './performer'

export type SignalFactory<P, R> = (payload$: Observable<P>) => Observable<R>

export type SignalPerformer<P, R> = Performer<P> & { signal$: Observable<R> }

export function signal<P = void, R = P>(factory?: SignalFactory<P, R>): SignalPerformer<P, R>

export function signal(factory?: SignalFactory<any, any>): SignalPerformer<any, any> {
  const signalSource = new Subject()

  return Object.assign(
    performer((payload$) => (factory ? factory(payload$) : payload$).pipe(tap(signalSource))),
    { signal$: signalSource.asObservable() },
  )
}
