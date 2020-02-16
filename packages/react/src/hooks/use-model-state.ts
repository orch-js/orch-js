import * as React from 'react'
import * as shallowequal from 'shallowequal'
import { map, distinctUntilChanged } from 'rxjs/operators'

import { Model } from '@orch/model'

const defaultSelector = <S>(state: S): S => state

export function useModelState<S>(model: Model<S>): S
export function useModelState<S, R>(
  model: Model<S>,
  inlineSelector: (state: S) => R,
  inlineSelectorDeps?: React.DependencyList,
): R
export function useModelState(
  model: Model<any>,
  inlineSelector: (state: any) => any = defaultSelector,
  inlineSelectorDeps: React.DependencyList = [],
): any {
  const [state, updateState] = React.useState(model.defaultState)
  const selector = React.useCallback(inlineSelector, inlineSelectorDeps)

  const subscription = React.useMemo(() => {
    // https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
    // To implement getDerivedStateFromProps, we need to subscribe state$ immediately.
    return model.state$
      .pipe(map(selector), distinctUntilChanged(shallowequal))
      .subscribe(updateState)
  }, [model, selector, updateState])

  React.useEffect(() => () => subscription.unsubscribe(), [subscription])

  return state
}
