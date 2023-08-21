import type { OrchModel } from './model'
import { activate } from './model'

let autoActivateEnabled = true

export const autoActivate = Object.assign(
  function autoActivate() {
    return function <M extends new (...params: any[]) => OrchModel<any>>(
      Model: M,
      _context?: ClassDecoratorContext,
    ) {
      return Object.defineProperties(
        class ModelWithAutoActivate extends Model {
          constructor(...params: any[]) {
            super(...params)

            if (autoActivateEnabled) {
              activate(this)
            }
          }
        },
        {
          name: { value: Model.name },
        },
      ) as M
    }
  },
  {
    deferActivation<T>(fn: () => T) {
      const previousState = autoActivateEnabled

      autoActivateEnabled = false
      const result = fn()
      autoActivateEnabled = previousState

      return result
    },
  },
)
