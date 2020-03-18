import { OrchModel } from '@orch/model'

export type ModelConstructor<Instance extends OrchModel<any>, Params extends any[]> = new (
  ...params: Params
) => Instance

export type ConstructorParams<CT> = CT extends ModelConstructor<any, infer Params> ? Params : void
