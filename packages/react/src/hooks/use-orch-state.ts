import React from 'react'
import shallowequal from 'shallowequal'
import { skip, map, distinctUntilChanged } from 'rxjs/operators'

import { OrchState } from '@orch/model'

const defaultSelector = <S>(state: S): S => state

export function useOrchState<S, D>(orchState: OrchState<S, D>): S & D
export function useOrchState<S, D, R>(
  orchState: OrchState<S, D>,
  inlineSelector: (state: S & D) => R,
  inlineSelectorDeps?: React.DependencyList,
): R
export function useOrchState<S, D, R>(
  orchState: OrchState<S, D>,
  inlineSelector?: (state: S & D) => R,
  inlineSelectorDeps?: React.DependencyList,
): R
export function useOrchState(
  orchState: OrchState<any>,
  inlineSelector: (state: any) => any = defaultSelector,
  inlineSelectorDeps: React.DependencyList = [],
): any {
  const selector = React.useCallback(inlineSelector, inlineSelectorDeps)
  const [state, updateState] = React.useState(() => selector(orchState.getState()))
  const isFirstRender = useIsFirstRender()

  const subscription = React.useMemo(() => {
    // https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
    // To implement getDerivedStateFromProps, we need to subscribe state$ immediately.
    return orchState.state$
      .pipe(
        map(selector),
        distinctUntilChanged(shallowequal),
        // We already have current state as React.useState's init state.
        // Subscribe state$ will immediately emit current state.
        // skip first emit to avoid unnecessary component update.
        skip(isFirstRender ? 1 : 0),
      )
      .subscribe(updateState)
  }, [orchState, selector, updateState])

  React.useEffect(() => () => subscription.unsubscribe(), [subscription])

  return state
}

function useIsFirstRender() {
  const isFirstRenderRef = React.useRef(true)

  React.useEffect(() => {
    isFirstRenderRef.current = false
  }, [])

  return isFirstRenderRef.current
}
