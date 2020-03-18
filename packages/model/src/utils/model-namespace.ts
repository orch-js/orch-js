import { OrchModel } from '../orch-model'

const uuid = (() => {
  type Prefix = string
  type Id = number

  const cache: Partial<Record<Prefix, Id>> = {}

  return function uuid(prefix: string) {
    const newId = (cache[prefix] ?? 0) + 1

    cache[prefix] = newId

    return `${prefix}-${newId}`
  }
})()

export function getModelNamespace(model: OrchModel<any>): string {
  const ModelClass = model.constructor as typeof OrchModel

  if (!ModelClass.namespace) {
    ModelClass.namespace = uuid(ModelClass.name)
  }

  return ModelClass.namespace
}
