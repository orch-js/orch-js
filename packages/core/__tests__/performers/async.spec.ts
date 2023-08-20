import { beforeEach, describe, expect, it, vi } from 'vitest'

import { activate, AsyncContext, deactivate, exhaustAsync, OrchModel, switchAsync } from '../../src'

describe(`switchAsync`, () => {
  let model: OrchModel<NonNullable<unknown>>

  beforeEach(() => {
    model = new OrchModel({})
    activate(model)
  })

  it(`should run with correct params`, async () => {
    const factorySpy = vi.fn(async (_a: AsyncContext, b: number) => `#${b}`)
    const handlerSpy = vi.fn(async (b: string) => b)
    const action = switchAsync(model, factorySpy, handlerSpy)

    await action(123)

    expect(factorySpy.mock.calls[0][0].signal).toBeInstanceOf(AbortSignal)
    expect(factorySpy.mock.calls[0][1]).toBe(123)
    expect(handlerSpy.mock.calls[0][0]).toBe('#123')
  })

  it(`should return factory's result if no handler exist`, async () => {
    const factorySpy = vi.fn(async (_a: AsyncContext, b: number) => `#${b}`)
    const action = switchAsync(model, factorySpy)

    expect(await action(123)).toBe('#123')
  })

  it(`should return handler's result if handler exist`, async () => {
    const action = switchAsync(
      model,
      async (_, num: number) => num + 1,
      async (num: number) => `#${num}`,
    )

    expect(await action(123)).toBe('#124')
  })

  it(`should start a new task if previous task finished`, async () => {
    const factorySpy = vi.fn(async (_a: AsyncContext, b: number) => `#${b}`)
    const handlerSpy = vi.fn((b: string) => b)
    const action = switchAsync(model, factorySpy, handlerSpy)

    await action(123)
    await action(456)

    expect(factorySpy).toBeCalledTimes(2)
    expect(handlerSpy.mock.calls).toEqual([['#123'], ['#456']])
  })

  it(`should abort the previous task if it's still ongoing and start a new one`, async () => {
    const abortSpy = vi.fn()
    const factorySpy = vi.fn()
    const handlerSpy = vi.fn()

    const action = switchAsync(
      model,
      ({ signal }, num: number) => {
        signal.addEventListener('abort', abortSpy)
        factorySpy()
        return new Promise((resolve) => setTimeout(() => resolve(`#${num}`), 100))
      },
      handlerSpy,
    )

    action(123)
    await action(456)

    expect(abortSpy).toBeCalledTimes(1)
    expect(factorySpy).toBeCalledTimes(2)
    expect(handlerSpy.mock.calls).toEqual([['#456']])
  })

  it(`should abort the ongoing task if model being disposed`, () => {
    const abortSpy = vi.fn()
    const handlerSpy = vi.fn()

    const action = switchAsync(
      model,
      ({ signal }) => {
        signal.addEventListener('abort', abortSpy)
        return new Promise(() => {})
      },
      handlerSpy,
    )

    action()
    deactivate(model)

    expect(abortSpy).toBeCalledTimes(1)
    expect(handlerSpy).toBeCalledTimes(0)
  })
})

describe(`exhaustAsync`, () => {
  let model: OrchModel<NonNullable<unknown>>

  beforeEach(() => {
    model = new OrchModel({})
    activate(model)
  })

  it(`should run with correct params`, async () => {
    const factorySpy = vi.fn(async (_context: AsyncContext, num: number) => num + 10)
    const handlerSpy = vi.fn(async (num: number) => `#${num}`)
    const action = exhaustAsync(model, factorySpy, handlerSpy)

    await action(456)

    expect(factorySpy.mock.calls[0][0].signal).toBeInstanceOf(AbortSignal)
    expect(factorySpy.mock.calls[0][1]).toEqual(456)
    expect(handlerSpy.mock.calls[0][0]).toEqual(466)
  })

  it(`should return factory's result if no handler exist`, async () => {
    const factorySpy = vi.fn(async (_a: AsyncContext, b: number) => `#${b}`)
    const action = exhaustAsync(model, factorySpy)

    expect(await action(123)).toBe('#123')
  })

  it(`should return handler's result if handler exist`, async () => {
    const action = exhaustAsync(
      model,
      async (_, num: number) => num + 1,
      async (num: number) => `#${num}`,
    )

    expect(await action(123)).toBe('#124')
  })

  it(`should start a new task if there's no ongoing task`, () => {
    const spy = vi.fn(async () => {})
    const action = exhaustAsync(model, spy)

    action()

    expect(spy).toBeCalledTimes(1)
  })

  it(`should start a new task if previous task finished`, async () => {
    const spy = vi.fn(async () => {})
    const action = exhaustAsync(model, spy)

    await action()
    await action()

    expect(spy).toBeCalledTimes(2)
  })

  it(`should return the current task instead of starting a new one if a task is already ongoing`, async () => {
    const abortSpy = vi.fn()
    const actionSpy = vi.fn()
    const handlerSpy = vi.fn((num: number) => `#${num}`)

    const action = exhaustAsync(
      model,
      ({ signal }, num: number) => {
        signal.addEventListener('abort', abortSpy)
        actionSpy()
        return new Promise((resolve) => setTimeout(() => resolve(num * 10), 50))
      },
      handlerSpy,
    )

    const a = action(1)
    const b = action(2)

    expect(abortSpy).toBeCalledTimes(0)
    expect(actionSpy).toBeCalledTimes(1)
    expect(a).toBe(b)
    expect(await b).toBe(`#10`)
  })

  it(`should abort the ongoing task if action being disposed`, () => {
    const abortSpy = vi.fn()

    const action = exhaustAsync(model, ({ signal }) => {
      signal.addEventListener('abort', abortSpy)
      return new Promise(() => {})
    })

    action()
    deactivate(model)

    expect(abortSpy).toBeCalledTimes(1)
  })
})
