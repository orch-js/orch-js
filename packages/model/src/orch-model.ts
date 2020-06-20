import { OrchState } from './orch-state'
import { DisposeSymbol } from './const'
import { isPerformer, disposePerformer, Performer } from './performers/performer'

export type OrchModelConstructor<P extends any[], M extends OrchModel<any>> = {
  new (...params: P): M
}

export type OrchModelParams<T> = T extends OrchModelConstructor<infer P, any> ? P : never

export type InitiatedOrchModel<T> = T extends OrchModelConstructor<any[], infer M> ? M : never

type PerformerInfo = { performer: Performer<any>; name: string }

export class OrchModel<S> {
  readonly state: OrchState<S>

  constructor(defaultState: S) {
    this.state = new OrchState(defaultState)
  }

  protected beforeDispose() {}

  [DisposeSymbol]() {
    this.beforeDispose()
    this.state.dispose()

    const { models, performers } = filterProperties(this)

    models.forEach(disposeModel)
    performers.forEach(({ performer }) => disposePerformer(performer))
  }
}

export function disposeModel<T extends OrchModel<any>>(model: T): T {
  model[DisposeSymbol]()
  return model
}

function filterProperties(model: OrchModel<any>) {
  const modelName = model.constructor.name
  const performers: PerformerInfo[] = []
  const models: OrchModel<any>[] = []

  Object.keys(model).forEach((key) => {
    const value = (model as any)[key]

    if (isPerformer(value)) {
      performers.push({ performer: value, name: `${modelName}:${key}` })
    } else if (value instanceof OrchModel) {
      models.push(value)
    }
  })

  return { performers, models }
}
