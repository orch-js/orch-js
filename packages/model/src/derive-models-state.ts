import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'

import type { OrchModel } from './orch-model'
import { OrchState } from './orch-state'
import { SetStateSymbol } from './const'

export type StateOfModels<Ms extends OrchModel<any>[]> = {
  [K in keyof Ms]: Ms[K] extends OrchModel<infer S> ? S : never
}

export function deriveModelsState<Ms extends OrchModel<any>[], S>(...models: Ms) {
  return factory

  function factory(f: (...states: StateOfModels<Ms>) => S): OrchState<S>
  function factory(f: (...states: any[]) => any): OrchState<any> {
    const defaultStates = models.map((model) => model.state.getState()) as StateOfModels<Ms>
    const orchState = new OrchState<S>(f(...defaultStates))

    const subscription = combineLatest(models.map((model) => model.state.state$))
      .pipe(map((states) => f(...states)))
      .subscribe((newState) => orchState[SetStateSymbol](newState))

    orchState.state$.subscribe({ complete: () => subscription.unsubscribe() })

    return orchState
  }
}
