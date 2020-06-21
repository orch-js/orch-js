import { nanoid } from 'nanoid'

import { OrchState } from './orch-state'
import { DisposeSymbol, DisposeLockSymbol } from './const'
import { isPerformer, disposePerformer, Performer } from './performers/performer'

export type OrchModelConstructor<P extends any[], M extends OrchModel<any>> = {
  new (...params: P): M
}

export type OrchModelParams<T> = T extends OrchModelConstructor<infer P, any> ? P : never

export type InitiatedOrchModel<T> = T extends OrchModelConstructor<any[], infer M> ? M : never

export type OrchModelLockId = string | null

type PerformerInfo = { performer: Performer<any>; name: string }

export class OrchModel<S> {
  readonly state: OrchState<S>

  constructor(defaultState: S) {
    this.state = new OrchState(defaultState)
  }

  protected beforeDispose() {}

  [DisposeSymbol](lockId: OrchModelLockId) {
    if (lockId !== this[DisposeLockSymbol]) {
      return
    }

    this.beforeDispose()
    this.state.dispose()

    const { models, performers } = filterProperties(this)

    models.forEach((model) => disposeModel(model, this[DisposeLockSymbol]))
    performers.forEach(({ performer }) => disposePerformer(performer))
  }

  [DisposeLockSymbol]: OrchModelLockId = null
}

export function disposeModel<T extends OrchModel<any>>(model: T, lockId: OrchModelLockId): T {
  model[DisposeSymbol](lockId)
  return model
}

export function preventOthersToDisposeModel(
  model: OrchModel<any>,
  lockId?: OrchModelLockId,
): OrchModelLockId {
  if (model[DisposeLockSymbol]) {
    return null
  }

  const _lockId = lockId ?? nanoid()
  const { models } = filterProperties(model)

  Object.defineProperty(model, DisposeLockSymbol, { value: _lockId })
  models.forEach((model) => preventOthersToDisposeModel(model, _lockId))

  return _lockId
}

function filterProperties(model: OrchModel<any>) {
  const modelName = model.constructor.name
  const performers: PerformerInfo[] = []
  const models: OrchModel<any>[] = []

  Object.keys(model).forEach((key) => {
    const value = (model as any)[key]

    if (isPerformer(value)) {
      performers.push({ performer: value, name: `${modelName}:${key}` })
    } else if (value instanceof OrchModel) {
      models.push(value)
    }
  })

  return { performers, models }
}
