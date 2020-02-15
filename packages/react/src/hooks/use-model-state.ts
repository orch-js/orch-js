import * as React from 'react'

import { Model } from '@orch/model'

export function useModelState<S>(model: Model<S>): S {
  const [state, updateState] = React.useState<S>(model.defaultState)

  const subscription = React.useMemo(() => {
    // https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
    // To implement getDerivedStateFromProps, we need to subscribe state$ immediately.
    return model.state$.subscribe(updateState)
  }, [model])

  React.useEffect(() => () => subscription.unsubscribe(), [subscription])

  return state
}
