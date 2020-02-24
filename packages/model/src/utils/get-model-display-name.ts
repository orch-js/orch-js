import { Model } from '../model'

export function getModelDisplayName(model: Model<any>): string {
  return model.constructor.name
}
