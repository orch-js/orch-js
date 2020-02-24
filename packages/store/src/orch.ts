import { Observable } from 'rxjs'

import { OrchState, OrchStateConfig } from './orch-state'
import { PerformerAction } from './performer'

export type OrchActionsFactory<State, Actions> = (
  orchState: OrchState<State>,
) => {
  actions: Actions
  process$: Observable<PerformerAction>
}

export class Orch<State, Actions> {
  get state$() {
    return this.orchState.state$
  }

  readonly actions: Actions

  readonly process$: Observable<PerformerAction>

  private readonly orchState: OrchState<State>

  constructor(config: OrchStateConfig<State>, actionsFactory: OrchActionsFactory<State, Actions>) {
    const orchState = new OrchState(config)
    const { actions, process$ } = actionsFactory(orchState)

    this.orchState = orchState
    this.actions = actions
    this.process$ = process$
  }

  getState() {
    return this.orchState.getState()
  }

  onDispose(callback: () => void) {
    this.orchState.onDispose(callback)
  }

  dispose() {
    this.orchState.dispose()
  }
}
