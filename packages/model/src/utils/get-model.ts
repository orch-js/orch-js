import { Model } from '../model'

type ModelConstructor<Instance extends Model<any>, Params extends any[]> = new (
  ...params: Params
) => Instance

export function getModel<M extends Model<any>, Params extends any[]>(
  ModelClass: ModelConstructor<M, Params>,
  params: ConstructorParameters<ModelConstructor<M, Params>>,
  defaultState?: M extends Model<infer SS> ? SS : never,
): M {
  const model = new ModelClass(...params)

  model.activateModel(defaultState)

  return model
}
