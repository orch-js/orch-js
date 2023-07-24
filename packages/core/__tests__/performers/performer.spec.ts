import { describe, expect, it, vi } from 'vitest'

import { disposePerformer, performer } from '../../src/performers/performer'

describe(`performers:performer`, () => {
  it(`should trigger 'next' while triggering performer`, () => {
    const spy = vi.fn()

    const _performer = performer<number>(() => ({ next: spy }))

    _performer(44)

    expect(spy.mock.calls).toEqual([[44]])
  })

  it(`should return 'next' fn's result while triggering performer`, () => {
    const obj = {}

    const _performer = performer<void, object>(() => ({
      next() {
        return obj
      },
    }))

    expect(_performer()).toBe(obj)
  })

  it(`should trigger 'dispose' while disposing performer`, () => {
    const spy = vi.fn()

    const _performer = performer<number>(() => ({
      next() {},
      dispose: spy,
    }))

    disposePerformer(_performer)

    expect(spy).toBeCalledTimes(1)
  })
})
