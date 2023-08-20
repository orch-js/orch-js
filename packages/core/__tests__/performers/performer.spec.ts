import { beforeEach, describe, expect, it, vi } from 'vitest'

import { activate, deactivate, OrchModel } from '../../src'
import { performer } from '../../src/performers/performer'

describe(`performers:performer`, () => {
  let model: OrchModel<NonNullable<unknown>>

  beforeEach(() => {
    model = new OrchModel({})
    activate(model)
  })

  it(`should trigger 'next' method while triggering performer`, () => {
    const spy = vi.fn()

    const action = performer<number>(model, () => ({
      next: spy,
      dispose() {},
    }))

    action(44)

    expect(spy.mock.calls).toEqual([[44]])
  })

  it(`should return 'next' method's result while triggering performer`, () => {
    const obj = {}

    const _performer = performer<void, object>(model, () => ({ next: () => obj, dispose() {} }))

    expect(_performer()).toBe(obj)
  })

  it(`should trigger 'dispose' while disposing performer`, () => {
    const spy = vi.fn()

    performer<number>(model, () => ({ next() {}, dispose: spy }))

    deactivate(model)

    expect(spy).toBeCalledTimes(1)
  })

  it('should throw an error while triggering the performer that has been disposed of', () => {
    const spy = vi.fn()

    const action = performer<void>(model, () => ({ next: spy, dispose() {} }))

    deactivate(model)

    expect(action).toThrowError()
    expect(spy).toHaveBeenCalledTimes(0)
  })

  it(`should call the factory function again if the model that has been disposed of is set up again`, () => {
    const spy = vi.fn(() => ({ next() {}, dispose() {} }))

    performer<number>(model, spy)

    expect(spy).toBeCalledTimes(1)

    deactivate(model)
    activate(model)

    expect(spy).toBeCalledTimes(2)
  })
})
