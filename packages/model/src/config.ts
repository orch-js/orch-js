import { OrchModel } from './orch-model'

export const ModelConfig = {
  resolveModel: <M extends OrchModel<any>>(ModelClass: new (...params: any) => M) => {
    if (ModelClass.length === 0) {
      return new ModelClass()
    } else {
      throw new Error(`Cannot automatically create an instance for model ${OrchModel.name}.`)
    }
  },
}
