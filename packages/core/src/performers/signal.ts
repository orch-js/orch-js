import { map, Observable, Subject } from 'rxjs'

import { epic } from './epic'
import { Performer } from './performer'

export type SignalFactory<P, R> = (payload$: Observable<P>) => Observable<R>

export type SignalPerformer<P, R> = Performer<P, void> & { signal$: Observable<R> }

export function signal<P = void, R = P>(factory?: SignalFactory<P, R>): SignalPerformer<P, R>

export function signal(factory?: SignalFactory<any, any>): SignalPerformer<any, any> {
  const signalSource = new Subject()

  return Object.assign(
    epic(
      (payload$, { action }) =>
        (factory ? factory(payload$) : payload$).pipe(
          map((value) => action(() => signalSource.next(value))),
        ),
      {
        factoryToLog: factory,
      },
    ),
    { signal$: signalSource.asObservable() },
  )
}
