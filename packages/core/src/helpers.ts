import { OrchModel, OrchModelState } from './model'

export function waitUntil<M extends OrchModel<any>>(
  model: M,
  validateFn: (state: OrchModelState<M>, model: M) => boolean,
) {
  return new Promise((resolve) => {
    model.on('change', () => {
      if (validateFn(model.getState() as OrchModelState<M>, model)) {
        resolve(model)
      }
    })
  })
}
