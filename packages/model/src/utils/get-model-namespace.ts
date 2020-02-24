import { Model } from '../model'
import { uuid } from './uuid'

const namespaceCacheMap = new WeakMap<Function, string>()

export function getModelNamespace(model: Model<any>): string {
  const key = model.constructor
  const cachedNamespace = namespaceCacheMap.get(key)

  if (cachedNamespace) {
    return cachedNamespace
  } else {
    const namespace = uuid('model-namespace')
    namespaceCacheMap.set(key, namespace)
    return namespace
  }
}
