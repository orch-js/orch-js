import { performer } from './performer'

export type AsyncContext = { signal: AbortSignal }
export type AsyncFactory<P, R> = (context: AsyncContext, payload: P) => Promise<R>

export function switchAsync<P = void, R = void>(factory: AsyncFactory<P, R>) {
  let abortCtl: AbortController | null

  return performer(() => ({
    next(payload: P) {
      abortCtl?.abort()
      abortCtl = new AbortController()

      return factory(abortCtl, payload)
    },
    dispose() {
      abortCtl?.abort()
      abortCtl = null
    },
  }))
}

export function exhaustAsync<P = void, R = void>(factory: AsyncFactory<P, R>) {
  let current: { promise: Promise<R>; abortCtl: AbortController } | null = null

  return performer(() => ({
    next(payload: P) {
      if (!current) {
        const abortCtl = new AbortController()
        const promise = factory(abortCtl, payload)

        promise.finally(() => (current = null))

        current = { promise, abortCtl }
      }

      return current.promise
    },
    dispose() {
      current?.abortCtl.abort()
      current = null
    },
  }))
}
