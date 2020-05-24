import { OrchState } from './orch-state'
import { SetupSymbol, DisposeSymbol } from './const'
import { isPerformer, setupPerformer, disposePerformer, Performer } from './performers/performer'

export type OrchModelConstructor<P extends any[], M extends OrchModel<any>> = {
  new (...params: P): M
}

export type OrchModelParams<T> = T extends OrchModelConstructor<infer P, any> ? P : never

export type InitiatedOrchModel<T> = T extends OrchModelConstructor<any[], infer M> ? M : never

type PerformerInfo = { performer: Performer<any, any>; name: string }

export class OrchModel<S> {
  readonly state: OrchState<S>

  private _performers: PerformerInfo[] | null = null

  private _models: OrchModel<any>[] | null = null

  constructor(defaultState: S) {
    this.state = new OrchState(defaultState)
  }

  protected afterSetup() {}

  protected beforeDispose() {}

  [SetupSymbol]() {
    if (this._performers && this._models) {
      return
    }

    const { performers, models } = filterProperties(this)

    models.forEach(setupModel)
    performers.forEach(({ performer, name }) => setupPerformer(performer, name, this.state))

    this._performers = performers
    this._models = models

    this.afterSetup()
  }

  [DisposeSymbol]() {
    this.beforeDispose()

    this._models?.forEach(disposeModel)
    this._performers?.forEach(({ performer }) => disposePerformer(performer))
    this.state.dispose()

    this._models = null
    this._performers = null
  }
}

export function setupModel<T extends OrchModel<any>>(model: T): T {
  model[SetupSymbol]()
  return model
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
