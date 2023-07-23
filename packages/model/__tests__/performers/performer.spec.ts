import { describe, expect, it, vi } from 'vitest'

import { disposePerformer, performer } from '../../src/performers/performer'

describe(`performers:performer`, () => {
  it(`should emit payload if trigger performer`, () => {
    const spy = vi.fn()

    const _performer = performer<number>(() => ({ next: spy }))

    _performer(44)

    expect(spy.mock.calls).toEqual([[44]])
  })

  it(`should throw error if performer is disposed`, () => {
    const _performer = performer<number>(() => ({
      next() {},
    }))

    disposePerformer(_performer)

    expect(() => _performer(44)).toThrow()
  })

  it(`should not emit payload if performer is disposed`, () => {
    const spy = vi.fn()

    const _performer = performer<number>(() => ({ next: spy }))

    disposePerformer(_performer)

    expect(() => _performer(44)).toThrow()
    expect(spy.mock.calls).toEqual([])
  })
})
