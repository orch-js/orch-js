import { DisposeSymbol } from '../const'
import { PayloadFunc } from '../utility-types'

export type Performer<P, R> = PayloadFunc<P, R> & {
  [DisposeSymbol]: () => void
}

export type PerformerFactory<P, R = void> = () => {
  next: (payload: P) => R
  dispose?: () => void
}

export function performer<P, R = void>(factory: PerformerFactory<P, R>): Performer<P, R> {
  let disposed = false
  const { next, dispose } = factory()

  return Object.assign(
    function trigger(payload: P) {
      if (disposed) {
        throw new Error('current performer is disposed')
      } else {
        return next(payload)
      }
    } as PayloadFunc<P, R>,

    {
      [DisposeSymbol]() {
        if (!disposed) {
          disposed = true
          dispose?.()
        }
      },
    },
  )
}

export function isPerformer(obj: any): obj is Performer<unknown, unknown> {
  return obj && typeof obj === 'function' && typeof obj[DisposeSymbol] === 'function'
}

export function disposePerformer(performer: Performer<any, any>) {
  performer[DisposeSymbol]()
}
