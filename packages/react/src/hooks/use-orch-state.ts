import * as React from 'react'
import * as shallowequal from 'shallowequal'
import { skip, map, distinctUntilChanged } from 'rxjs/operators'

import { Orch } from '@orch/store'

const defaultSelector = <S>(state: S): S => state

export function useOrchState<S>(orch: Orch<S, any>): S
export function useOrchState<S, R>(
  orch: Orch<S, any>,
  inlineSelector: (state: S) => R,
  inlineSelectorDeps?: React.DependencyList,
): R
export function useOrchState<S, R>(
  orch: Orch<S, any>,
  inlineSelector?: (state: S) => R,
  inlineSelectorDeps?: React.DependencyList,
): R
export function useOrchState(
  orch: Orch<any, any>,
  inlineSelector: (state: any) => any = defaultSelector,
  inlineSelectorDeps: React.DependencyList = [],
): any {
  const selector = React.useCallback(inlineSelector, inlineSelectorDeps)
  const [state, updateState] = React.useState(() => selector(orch.state.getState()))
  const isFirstRender = useIsFirstRender()

  const subscription = React.useMemo(() => {
    // https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
    // To implement getDerivedStateFromProps, we need to subscribe state$ immediately.
    return orch.state.state$
      .pipe(
        map(selector),
        distinctUntilChanged(shallowequal),
        // We already have current state as React.useState's init state.
        // Subscribe state$ will immediately emit current state.
        // skip first emit to avoid unnecessary component update.
        skip(isFirstRender ? 1 : 0),
      )
      .subscribe(updateState)
  }, [orch, selector, updateState])

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
