import { produce } from 'immer'

export function immutableState<T>(state: T): T {
  return produce(state, () => {})
}
