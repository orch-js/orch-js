import { OrchModel } from './model'

export function waitUntil<M extends OrchModel<any>>(model: M, validateFn: (model: M) => boolean) {
  return new Promise((resolve) => {
    model.on('change', () => {
      if (validateFn(model)) {
        resolve(model)
      }
    })
  })
}
