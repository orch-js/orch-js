import { OrchModel } from '@orch/core'

export type ModelConstructor<Instance extends OrchModel<any>, Params extends any[]> = new (
  ...params: Params
) => Instance

export type ConstructorParams<CT> = CT extends ModelConstructor<any, infer Params> ? Params : void
