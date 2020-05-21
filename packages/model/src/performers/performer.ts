import { Observable, Subject, Subscription } from 'rxjs'
import { catchError } from 'rxjs/operators'

import { PayloadFunc } from '@orch/utility-types'

import { OrchState } from '../orch-state'

const SetupSymbol: unique symbol = Symbol.for('orch:setup-performer')

const DisposeSymbol: unique symbol = Symbol.for('orch:dispose-performer')

export type Performer<P, S> = PayloadFunc<P, void> & {
  [SetupSymbol]: (displayName: string, orchState: OrchState<S>) => void
  [DisposeSymbol]: () => void
}

export type PerformerFactoryParam<P, S> = {
  payload$: Observable<P>
  orchState: OrchState<S>
}

export type PerformerFactory<P, S> = (param: PerformerFactoryParam<P, S>) => Observable<any>

const NOT_SETUP_ERROR_MSG = 'Orch: performer is not setup properly.'

const MULTI_SETUP_ERROR_MSG = 'Orch: performer has been setup.'

export function performer<P, S>(factory: PerformerFactory<P, S>): Performer<P, S> {
  let payloadSource: Subject<P> | null = null
  let subscription: Subscription | null = null

  return Object.assign(
    function trigger(payload: P) {
      if (payloadSource) {
        payloadSource.next(payload)
      } else {
        throw new Error(NOT_SETUP_ERROR_MSG)
      }
    } as PayloadFunc<P, void>,

    {
      [SetupSymbol](displayName: string, orchState: OrchState<S>) {
        if (payloadSource || subscription) {
          throw new Error(MULTI_SETUP_ERROR_MSG)
        } else {
          payloadSource = new Subject()
          subscription = factory({ payload$: payloadSource.asObservable(), orchState })
            .pipe(
              catchError((err, caught) => {
                /* eslint-disable no-console */
                console.group('[Orch]: Performer error')
                console.log(`name: ${displayName}`)
                console.log('factory: ', factory)
                console.error(err)
                console.groupEnd()
                /* eslint-enable no-console */
                return caught
              }),
            )
            .subscribe()
        }
      },

      [DisposeSymbol]() {
        payloadSource?.complete()
        subscription?.unsubscribe()
      },
    },
  )
}

export function isPerformer(obj: any): obj is Performer<any, any> {
  return (
    obj &&
    typeof obj === 'function' &&
    typeof obj[SetupSymbol] === 'function' &&
    typeof obj[DisposeSymbol] === 'function'
  )
}

export function setupPerformer(
  performer: Performer<any, any>,
  displayName: string,
  orchState: OrchState<any>,
) {
  performer[SetupSymbol](displayName, orchState)
}

export function disposePerformer(performer: Performer<any, any>) {
  performer[DisposeSymbol]()
}
