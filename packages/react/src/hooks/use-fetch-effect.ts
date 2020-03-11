import * as React from 'react'

export function useFetchEffect(
  fetchEffect: React.EffectCallback,
  deps: React.DependencyList,
): void {
  const teardownLogic = React.useMemo(fetchEffect, deps)
  React.useEffect(() => teardownLogic, [teardownLogic])
}
