import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { OrchState } from './orch-state'
import { SetStateSymbol } from './const'

export type DerivableModelType<S> = { orchState: { getState: () => S; state$: Observable<S> } }

export type DerivableModels<Sn extends any[]> = {
  [K in keyof Sn]: DerivableModelType<Sn[K]>
}

export function deriveModelsState<Sn extends any[]>(...models: DerivableModels<Sn>) {
  return <R>(f: (...states: Sn) => R): OrchState<R> => {
    const defaultStates = models.map((model) => model.orchState.getState()) as Sn
    const orchState = new OrchState<R>(f(...defaultStates))

    const subscription = combineLatest(models.map((model) => model.orchState.state$))
      .pipe(map((states) => f(...(states as Sn))))
      .subscribe((newState) => orchState[SetStateSymbol](newState))

    orchState.state$.subscribe({ complete: () => subscription.unsubscribe() })

    return orchState
  }
}
