import { ResetSymbol } from '../const'
import { PayloadFunc } from '../utility-types'

export type Performer<P, R> = PayloadFunc<P, R> & {
  [ResetSymbol]: () => void
}

export type PerformerFactory<P, R = void> = () => {
  next: (payload: P) => R
  reset?: () => void
}

export function performer<P, R = void>(factory: PerformerFactory<P, R>): Performer<P, R> {
  const { next, reset } = factory()

  return Object.assign(
    function trigger(payload: P) {
      return next(payload)
    } as PayloadFunc<P, R>,

    {
      [ResetSymbol]() {
        reset?.()
      },
    },
  )
}

export function isPerformer(obj: any): obj is Performer<unknown, unknown> {
  return obj && typeof obj === 'function' && typeof obj[ResetSymbol] === 'function'
}

export function resetPerformer(performer: Performer<any, any>) {
  performer[ResetSymbol]()
}
