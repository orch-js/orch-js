import { describe, expect, it, vi } from 'vitest'

import { autoActivate, OrchModel, reducer } from '../../src'

describe(`performers:reducer`, () => {
  it(`should be able to update state by return the new one`, () => {
    @autoActivate()
    class CountModel extends OrchModel<{ count: number }> {
      addCount = reducer(this, (state, count: number) => {
        return { count: state.count + count }
      })
    }

    const model = new CountModel({ count: 0 })

    model.addCount(1)
    model.addCount(2)

    expect(model.getState()).toEqual({ count: 3 })
  })

  it(`should not update state if return current state directly`, () => {
    @autoActivate()
    class CountModel extends OrchModel<{ count: number }> {
      setCount = reducer(this, (state, count: number) => {
        if (state.count === count) return state

        return { count }
      })
    }

    const model = new CountModel({ count: 0 })
    const spy = vi.fn()

    model.on.change(spy)

    model.setCount(44)
    expect(spy).toBeCalledTimes(1)

    model.setCount(44)
    expect(spy).toBeCalledTimes(1)
  })

  it(`should keep working after error`, () => {
    @autoActivate()
    class CountModel extends OrchModel<{ count: number }> {
      setCount = reducer(this, (_, count: number) => {
        if (count < 0) {
          throw new Error()
        }

        return { count }
      })
    }

    const model = new CountModel({ count: 0 })

    expect(() => model.setCount(-1)).toThrow()

    model.setCount(55)

    expect(model.getState()).toEqual({ count: 55 })
  })

  it('should be able to pass multiple params', () => {
    @autoActivate()
    class CountModel extends OrchModel<{ count: number }> {
      add = reducer(this, (_, a: number, b: number) => ({ count: a + b }))
    }

    const model = new CountModel({ count: 0 })

    model.add(1, 2)

    expect(model.getState()).toEqual({ count: 3 })
  })
})
