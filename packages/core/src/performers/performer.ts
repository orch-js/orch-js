import type { OrchModel } from '../model'
import type { PayloadFunc } from '../utility-types'

export type Performer<P, R> = PayloadFunc<P, R>

export type PerformerFactory<P, R = void> = () => {
  next: (payload: P) => R
  reset?: () => void
}

export function performer<P, R = void>(
  model: OrchModel<any>,
  factory: PerformerFactory<P, R>,
): Performer<P, R> {
  const { next, reset } = factory()

  if (reset) {
    model.on('reset', reset)
  }

  return ((payload) => {
    return next(payload)
  }) as Performer<P, R>
}
