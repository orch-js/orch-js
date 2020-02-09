import { ActionSymbol } from '../symbols'
import { Action, Dispatcher } from './types'

export function dispatcherFactory<P>(dispatcher: (payload: P) => void): Dispatcher<P>
export function dispatcherFactory(dispatcher: (payload: any) => void): Dispatcher<any> {
  return Object.assign(dispatcher, {
    asAction(payload: any): Action {
      return action(() => dispatcher(payload))
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
