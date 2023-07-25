import { nanoid } from 'nanoid'

import { OrchModel } from './model'
import { disposePerformer, isPerformer, Performer } from './performers/performer'

export type OrchModelLockId = string | null

const lockMap = new WeakMap<OrchModel<any>, OrchModelLockId>()

export function disposeModel<T extends OrchModel<any>>(model: T, lockId: OrchModelLockId) {
  const modelLockId = lockMap.get(model) ?? null

  if (modelLockId === lockId) {
    const { models, performers } = filterProperties(model)

    models.forEach((model) => disposeModel(model, modelLockId))
    performers.forEach((performer) => disposePerformer(performer))
    model.dispose()
  }
}

export function preventOthersToDisposeModel(
  model: OrchModel<any>,
  customLockId?: OrchModelLockId,
): OrchModelLockId {
  if (lockMap.get(model)) {
    return null
  }

  const lockId = customLockId ?? nanoid()
  const { models } = filterProperties(model)

  lockMap.set(model, lockId)
  models.forEach((model) => preventOthersToDisposeModel(model, lockId))

  return lockId
}

function filterProperties(model: OrchModel<unknown>) {
  const performers: Performer<unknown, unknown>[] = []
  const models: OrchModel<unknown>[] = []

  Object.keys(model).forEach((key) => {
    const value = (model as any)[key]

    if (isPerformer(value)) {
      performers.push(value)
    } else if (value instanceof OrchModel) {
      models.push(value)
    }
  })

  return { performers, models }
}
