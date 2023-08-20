import type { OrchModel } from '../model'
import type { PayloadFunc } from '../utility-types'

export type Performer<P, R> = PayloadFunc<P, R>

export type PerformerFactory<P, R = void> = () => {
  next: (payload: P) => R
  dispose: () => void
}

export function performer<P, R = void>(
  model: OrchModel<any>,
  factory: PerformerFactory<P, R>,
): Performer<P, R> {
  let current: ReturnType<PerformerFactory<P, R>> | null = null

  const dispose = () => {
    current?.dispose()
    current = null
  }

  const setup = () => {
    dispose()
    current = factory()
  }

  model.on.setup(setup)
  model.on.dispose(dispose)

  if (!model.isDisposed) {
    setup()
  }

  return ((payload) => {
    if (!current) {
      throw new Error('orch: performer has been disposed')
    }

    return current.next(payload)
  }) as Performer<P, R>
}
