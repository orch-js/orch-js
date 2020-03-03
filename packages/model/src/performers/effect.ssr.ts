import { Observable, Subject, NEVER } from 'rxjs'
import { endWith, startWith } from 'rxjs/operators'

import { OrchStore, PerformerAction } from '@orch/store'

export enum SsrActionType {
  Start = 'Start',
  End = 'End',
}

export function ssrAware(
  actions$: Observable<PerformerAction | null>,
): Observable<PerformerAction | null | SsrActionType> {
  return actions$.pipe(startWith(SsrActionType.Start), endWith(SsrActionType.End))
}

export function isSsrAction(action: PerformerAction | SsrActionType): action is SsrActionType {
  return action === SsrActionType.Start || action === SsrActionType.End
}

export function handleSsrAction(store: OrchStore) {
  if (!store.ssrWaitingGroup.enabled) {
    return () => NEVER
  }

  return (actions$: Observable<SsrActionType>) => {
    return new Observable<never>((observer) => {
      let subject: Subject<void> | null = null

      return actions$.subscribe({
        next: (action) => {
          switch (action) {
            case SsrActionType.Start:
              if (subject) {
                subject.complete()
                console.error('[SSR Error]: There is already emitted `Start` action.')
              }

              subject = new Subject<void>()
              store.ssrWaitingGroup.push(subject.toPromise())
              break
            case SsrActionType.End:
              if (subject) {
                subject.complete()
                subject = null
              } else {
                console.error('[SSR Error]: Should emit `Start` action before emit `End` action.')
              }
              break
          }
        },
        complete: () => {
          subject?.complete()
          observer.complete()
        },
      })
    })
  }
}
