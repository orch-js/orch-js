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
  readonly actions: Actions

  readonly process$: Observable<PerformerAction>

  readonly state: OrchState<State>

  constructor(config: OrchStateConfig<State>, actionsFactory: OrchActionsFactory<State, Actions>) {
    const orchState = new OrchState(config)
    const { actions, process$ } = actionsFactory(orchState)

    this.state = orchState
    this.actions = actions
    this.process$ = process$
  }

  onDispose(callback: () => void) {
    this.state.onDispose(callback)
  }

  dispose() {
    this.state.dispose()
  }
}
