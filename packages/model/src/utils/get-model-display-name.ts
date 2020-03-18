import { OrchModel } from '../orch-model'

export function getModelDisplayName(model: OrchModel<any>): string {
  return model.constructor.name
}
