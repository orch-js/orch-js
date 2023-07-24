import { describe, expect, it, vi } from 'vitest'

import { exhaustAsync, switchAsync } from '../../src'
import { DisposeSymbol } from '../../src/const'

describe(`switchAsync`, () => {
  it(`should run with correct params`, () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const spy = vi.fn(async (_a: any, _b: any) => {})
    const action = switchAsync<number>(spy)

    action(123)

    expect(spy.mock.calls[0][0]).toBeInstanceOf(AbortController)
    expect(spy.mock.calls[0][1]).toEqual(123)
  })

  it(`should start a new task if no previous one`, () => {
    const spy = vi.fn(async () => {})
    const action = switchAsync(spy)

    action()

    expect(spy).toBeCalledTimes(1)
  })

  it(`should start a new task if previous task finished`, async () => {
    const spy = vi.fn(async () => {})
    const action = switchAsync(spy)

    await action()
    await action()

    expect(spy).toBeCalledTimes(2)
  })

  it(`should abort the previous task if it's still ongoing and start a new one`, () => {
    const abortSpy = vi.fn()
    const actionSpy = vi.fn()

    const action = switchAsync(({ signal }) => {
      signal.addEventListener('abort', abortSpy)
      actionSpy()
      return new Promise(() => {})
    })

    action()
    action()

    expect(abortSpy).toBeCalledTimes(1)
    expect(actionSpy).toBeCalledTimes(2)
  })

  it(`should should abort the ongoing task if action being disposed`, () => {
    const abortSpy = vi.fn()

    const action = switchAsync(({ signal }) => {
      signal.addEventListener('abort', abortSpy)
      return new Promise(() => {})
    })

    action()
    action[DisposeSymbol]()

    expect(abortSpy).toBeCalledTimes(1)
  })
})

describe(`exhaustAsync`, () => {
  it(`should run with correct params`, () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const spy = vi.fn(async (_a: any, _b: any) => {})
    const action = exhaustAsync<number>(spy)

    action(456)

    expect(spy.mock.calls[0][0]).toBeInstanceOf(AbortController)
    expect(spy.mock.calls[0][1]).toEqual(456)
  })

  it(`should start a new task if there's no ongoing task`, () => {
    const spy = vi.fn(async () => {})
    const action = exhaustAsync(spy)

    action()

    expect(spy).toBeCalledTimes(1)
  })

  it(`should start a new task if previous task finished`, async () => {
    const spy = vi.fn(async () => {})
    const action = exhaustAsync(spy)

    await action()
    await action()

    expect(spy).toBeCalledTimes(2)
  })

  it(`should return the current task instead of starting a new one if a task is already ongoing`, () => {
    const abortSpy = vi.fn()
    const actionSpy = vi.fn()

    const action = exhaustAsync(({ signal }) => {
      signal.addEventListener('abort', abortSpy)
      actionSpy()
      return new Promise(() => {})
    })

    const a = action()
    const b = action()

    expect(abortSpy).toBeCalledTimes(0)
    expect(actionSpy).toBeCalledTimes(1)
    expect(a).toBe(b)
  })

  it(`should should abort the ongoing task if action being disposed`, () => {
    const abortSpy = vi.fn()

    const action = exhaustAsync(({ signal }) => {
      signal.addEventListener('abort', abortSpy)
      return new Promise(() => {})
    })

    action()
    action[DisposeSymbol]()

    expect(abortSpy).toBeCalledTimes(1)
  })
})
