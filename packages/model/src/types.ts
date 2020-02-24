import { PayloadFunc, OmitNeverProperties } from '@orch/utility-types'
import { Orch, Performer } from '@orch/store'

import { Model } from './model'

export type ModelState<M extends Model<any>> = M extends Model<infer S> ? S : never

export type ModelActions<M extends Model<any>> = OmitNeverProperties<
  {
    [K in keyof M]: M[K] extends Performer<infer P, any> ? PayloadFunc<P, void> : never
  }
>

export type ModelToOrch<M extends Model<any>> = Orch<ModelState<M>, ModelActions<M>>
