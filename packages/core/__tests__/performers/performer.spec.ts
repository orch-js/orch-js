import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OrchModel } from '../../src'
import { performer } from '../../src/performers/performer'

describe(`performers:performer`, () => {
  let model: OrchModel<NonNullable<unknown>>

  beforeEach(() => {
    model = new OrchModel({})
  })

  it(`should trigger 'next' while triggering performer`, () => {
    const spy = vi.fn()

    const _performer = performer<number>(model, () => ({ next: spy }))

    _performer(44)

    expect(spy.mock.calls).toEqual([[44]])
  })

  it(`should return 'next' fn's result while triggering performer`, () => {
    const obj = {}

    const _performer = performer<void, object>(model, () => ({ next: () => obj }))

    expect(_performer()).toBe(obj)
  })

  it(`should trigger 'reset' while disposing performer`, () => {
    const spy = vi.fn()

    performer<number>(model, () => ({ next() {}, reset: spy }))

    model.reset()

    expect(spy).toBeCalledTimes(1)
  })
})
