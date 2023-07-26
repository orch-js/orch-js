import { subscribe } from './internal-actions'
import { OrchModel } from './model'

export function waitUntil<M extends OrchModel<any>>(model: M, validateFn: (model: M) => boolean) {
  return new Promise((resolve) => {
    subscribe('change', model, () => {
      if (validateFn(model)) {
        resolve(model)
      }
    })
  })
}
