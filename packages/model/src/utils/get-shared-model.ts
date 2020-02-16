import { Model } from '@orch/model'

function isSharedModelClass(ModelClass: any): ModelClass is typeof Model {
  return Object.prototype.isPrototypeOf.call(Model, ModelClass)
}

const cacheMap = new Map<Function, Model<any>>()

getSharedModel.clear = () => cacheMap.clear()

export function getSharedModel<M extends Model<any>>(ModelClass: new (...params: any) => M): M {
  if (isSharedModelClass(ModelClass)) {
    const cachedModel = cacheMap.get(ModelClass)

    if (cachedModel) {
      return cachedModel as M
    }

    const model = ModelClass.createSharedInstance()

    model.activateModel()
    cacheMap.set(ModelClass, model)

    return model as M
  }

  throw new Error(`${ModelClass} is not a subclass of Model`)
}
