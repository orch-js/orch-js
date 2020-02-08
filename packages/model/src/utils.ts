import { Dispatcher, Action } from './types'

export function dispatcherFactory<P>(callback: (payload: P) => void): Dispatcher<P> {
  return Object.assign(callback, {
    asAction(payload: P): Action {
      return () => callback(payload)
    },
  })
}

export function noop() {}
