import { nanoid } from 'nanoid'
import { disposePerformer, isPerformer, Performer } from './performers/performer'
import { OrchModel } from './orch-model'
import { OrchState } from './orch-state'

export type OrchModelLockId = string | null

const lockMap = new WeakMap<OrchModel<any>, OrchModelLockId>()

export function disposeModel<T extends OrchModel<any>>(model: T, lockId: OrchModelLockId) {
  const modelLockId = lockMap.get(model) ?? null

  if (modelLockId === lockId) {
    model['beforeDispose']()

    const { models, performers, states } = filterProperties(model)

    models.forEach((model) => disposeModel(model, modelLockId))
    states.forEach((state) => state.dispose())
    performers.forEach((performer) => disposePerformer(performer))
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

function filterProperties(model: OrchModel<any>) {
  const performers: Performer<any>[] = []
  const models: OrchModel<any>[] = []
  const states: OrchState<any>[] = []

  Object.keys(model).forEach((key) => {
    const value = (model as any)[key]

    if (isPerformer(value)) {
      performers.push(value)
    } else if (value instanceof OrchModel) {
      models.push(value)
    } else if (value instanceof OrchState) {
      states.push(value)
    }
  })

  return { performers, models, states }
}
