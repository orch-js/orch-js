import * as React from 'react'
import * as shallowequal from 'shallowequal'
import { skip, map, distinctUntilChanged } from 'rxjs/operators'

import { OrchModel } from '@orch/model'

const defaultSelector = <S>(state: S): S => state

export function useModelState<S>(model: OrchModel<S>): S
export function useModelState<S, R>(
  model: OrchModel<S>,
  inlineSelector: (state: S) => R,
  inlineSelectorDeps?: React.DependencyList,
): R
export function useModelState<S, R>(
  model: OrchModel<S>,
  inlineSelector?: (state: S) => R,
  inlineSelectorDeps?: React.DependencyList,
): R
export function useModelState(
  model: OrchModel<any>,
  inlineSelector: (state: any) => any = defaultSelector,
  inlineSelectorDeps: React.DependencyList = [],
): any {
  const selector = React.useCallback(inlineSelector, inlineSelectorDeps)
  const [state, updateState] = React.useState(() => selector(model.state.getState()))
  const isFirstRender = useIsFirstRender()

  const subscription = React.useMemo(() => {
    // https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
    // To implement getDerivedStateFromProps, we need to subscribe state$ immediately.
    return model.state.state$
      .pipe(
        map(selector),
        distinctUntilChanged(shallowequal),
        // We already have current state as React.useState's init state.
        // Subscribe state$ will immediately emit current state.
        // skip first emit to avoid unnecessary component update.
        skip(isFirstRender ? 1 : 0),
      )
      .subscribe(updateState)
  }, [model, selector, updateState])

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
