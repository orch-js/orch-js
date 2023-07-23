import { describe, expect, it, vi } from 'vitest'

import { disposePerformer, performer } from '../../src/performers/performer'

describe(`performers:performer`, () => {
  it(`should trigger 'next' while triggering performer`, () => {
    const spy = vi.fn()

    const _performer = performer<number>(() => ({ next: spy }))

    _performer(44)

    expect(spy.mock.calls).toEqual([[44]])
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
