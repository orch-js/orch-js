import { disposePerformer, isPerformer, Performer, setupPerformer } from './performers/performer'
import { OrchModelConstructor, OrchModelParams, InitiatedOrchModel } from './orch-model'

export type DestroyOrchModel = () => void

export function initModel<T extends OrchModelConstructor<any, any>>(
  Model: T,
  ...params: OrchModelParams<T>
): [DestroyOrchModel, InitiatedOrchModel<T>] {
  const model: InitiatedOrchModel<T> = new (Model as any)(...params)
  const modelName = Model.name
  const performers: Performer<any, any>[] = []

  activateOrchModel()

  return [destroyOrchModel, model]

  function destroyOrchModel() {
    performers.forEach(disposePerformer)
  }

  function activateOrchModel() {
    Object.keys(model).forEach((key) => {
      const value = (model as any)[key]

      if (isPerformer(value)) {
        performers.push(value)
        setupPerformer(value, `${modelName}:${key}`, model.state)
      }
    })
  }
}
