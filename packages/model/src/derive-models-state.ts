import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { SetStateSymbol } from './const'
import { OrchState } from './orch-state'

export type DerivableModelType<S> = { state: { getState: () => S; state$: Observable<S> } }

export type DerivableModels<Sn extends any[]> = {
  [K in keyof Sn]: DerivableModelType<Sn[K]>
}

export function deriveModelsState<Sn extends any[]>(...models: DerivableModels<Sn>) {
  return <R>(f: (...states: Sn) => R): OrchState<R> => {
    const defaultStates = models.map((model) => model.state.getState()) as Sn
    const orchState = new OrchState<R>(f(...defaultStates))

    const subscription = combineLatest(models.map((model) => model.state.state$))
      .pipe(map((states) => f(...(states as Sn))))
      .subscribe((newState) => orchState[SetStateSymbol](newState))

    orchState.state$.subscribe({ complete: () => subscription.unsubscribe() })

    return orchState
  }
}
