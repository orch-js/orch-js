import { PayloadFunc, OmitNeverProperties } from '@orch/utility-types'
import { Orch, Performer } from '@orch/store'

import { OrchModel } from './orch-model'

export type ModelState<M extends OrchModel<any>> = M extends OrchModel<infer S> ? S : never

export type ModelActions<M extends OrchModel<any>> = OmitNeverProperties<
  {
    [K in keyof M]: M[K] extends Performer<infer P, any> ? PayloadFunc<P, void> : never
  }
>

export type ModelToOrch<M extends OrchModel<any>> = Orch<ModelState<M>, ModelActions<M>>
