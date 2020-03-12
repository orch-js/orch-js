import { Model } from './model'

export const ModelConfig = {
  resolveModel: <M extends Model<any>>(ModelClass: new (...params: any) => M) => {
    if (ModelClass.length === 0) {
      return new ModelClass()
    } else {
      throw new Error(`Cannot automatically create an instance for model ${Model.name}.`)
    }
  },
}
