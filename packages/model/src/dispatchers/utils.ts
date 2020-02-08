import { Action, Dispatcher } from './types'
import { ActionSymbol } from './symbols'

export function dispatcher<P>(callback: (payload: P) => void): Dispatcher<P> {
  return Object.assign(callback, {
    asAction(payload: P): Action {
      return action(() => callback(payload))
    },
  })
}

export function action(callback: () => void): Action {
  return Object.assign(callback, {
    identify: ActionSymbol,
  } as const)
}

export function isAction(action: any): boolean {
  return typeof action === 'function' && action.identify === ActionSymbol
}
