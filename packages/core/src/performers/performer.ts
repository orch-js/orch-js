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

  model.on.activate(setup)
  model.on.deactivate(dispose)

  if (model.status === 'active') {
    setup()
  }

  return ((payload) => {
    if (!current) {
      throw new Error(
        `Cannot trigger a performer, since the model [${model.constructor.name}] is in "${model.status}" status`,
      )
    }

    return current.next(payload)
  }) as Performer<P, R>
}
