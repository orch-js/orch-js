import { Performer, performer } from './performer'

export type AsyncContext = { signal: AbortSignal }
export type AsyncFactory<P, R> = (context: AsyncContext, payload: P) => Promise<R>

const ENDLESS_PROMISE = new Promise<any>(() => {})
const defaultHandler = <T>(value: T) => value
const skipIfAborted = async <R>(signal: AbortSignal, fn: () => R): Promise<Awaited<R>> => {
  if (signal.aborted) {
    return ENDLESS_PROMISE
  } else {
    return await fn()
  }
}

export function switchAsync<P = void, FR = void>(
  factory: AsyncFactory<P, FR>,
): Performer<P, Promise<Awaited<FR>>>
export function switchAsync<P = void, FR = void, HR = void>(
  factory: AsyncFactory<P, FR>,
  handler: (result: FR) => HR,
): Performer<P, Promise<Awaited<HR>>>
export function switchAsync<P = void, FR = void, HR = void>(
  factory: AsyncFactory<P, FR>,
  handler?: (result: FR) => HR,
) {
  let abortCtl: AbortController | null

  return performer(() => ({
    next(payload: P) {
      abortCtl?.abort()
      abortCtl = new AbortController()

      const signal = abortCtl.signal

      return factory({ signal }, payload)
        .then((value) => skipIfAborted(signal, () => (handler ?? defaultHandler)(value)))
        .catch((error) => skipIfAborted(signal, () => Promise.reject(error)))
    },
    reset() {
      abortCtl?.abort()
      abortCtl = null
    },
  }))
}

export function exhaustAsync<P = void, FR = void>(
  factory: AsyncFactory<P, FR>,
): Performer<P, Promise<Awaited<FR>>>
export function exhaustAsync<P = void, FR = void, HR = void>(
  factory: AsyncFactory<P, FR>,
  handler: (result: FR) => HR,
): Performer<P, Promise<Awaited<HR>>>
export function exhaustAsync<P = void, FR = void, HR = void>(
  factory: AsyncFactory<P, FR>,
  handler?: (result: FR) => HR,
) {
  let current: { promise: Promise<HR | FR>; abortCtl: AbortController } | null = null

  return performer(() => ({
    next(payload: P): Promise<HR | FR> {
      if (!current) {
        const abortCtl = new AbortController()
        const signal = abortCtl.signal
        const promise = factory({ signal }, payload)
          .then((value) => skipIfAborted(signal, () => (handler ?? defaultHandler<FR>)(value)))
          .catch((error) => skipIfAborted(signal, () => Promise.reject<HR>(error)))

        promise.finally(() => (current = null))

        current = { promise, abortCtl }
      }

      return current.promise
    },
    reset() {
      current?.abortCtl.abort()
      current = null
    },
  }))
}
