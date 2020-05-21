import { OrchState } from './orch-state'
import { isPerformer, setupPerformer, disposePerformer, Performer } from './performers/performer'

export type DestroyOrchModel = () => void

export type OrchModelParams<T> = T extends new (...params: infer P) => OrchModel<any> ? P : never

export type CreatedOrchModel<T> = T extends new (...params: any[]) => infer M ? M : never

export class OrchModel<S> {
  static create<T extends new (...params: any[]) => OrchModel<any>>(
    this: T,
    ...params: OrchModelParams<T>
  ): [DestroyOrchModel, CreatedOrchModel<T>] {
    const model: CreatedOrchModel<T> = new (this as any)(...params)
    const modelName = this.name
    const performers: Performer<any, any>[] = []

    activateOrchModel()

    return [destroyOrchModel, model]

    function destroyOrchModel() {
      performers.forEach(disposePerformer)
    }

    function activateOrchModel() {
      Object.keys(model).forEach((key) => {
        const value = (model as any)[key]

        if (isPerformer(value)) {
          performers.push(value)
          setupPerformer(value, `${modelName}:${key}`, model.state)
        }
      })
    }
  }

  readonly state: OrchState<S>

  protected constructor(defaultState: S) {
    this.state = new OrchState(defaultState)
  }
}
