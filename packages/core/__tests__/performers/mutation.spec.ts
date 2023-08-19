import { describe, expect, it } from 'vitest'

import { mutation, OrchModel } from '../../src'

describe(`performers:mutation`, () => {
  it(`should use current state to produce`, () => {
    class CountModel extends OrchModel<{ count: number }> {
      addCount = mutation(this, (state, num: number) => {
        state.count += num
      })
    }

    const model = new CountModel({ count: 0 })

    model.addCount(1)
    model.addCount(2)

    expect(model.getState()).toEqual({ count: 3 })
  })

  it(`should be able to update state by mutating the current one`, () => {
    class CountModel extends OrchModel<{ count: number }> {
      setCount = mutation(this, (state, count: number) => {
        state.count = count
      })
    }

    const model = new CountModel({ count: 0 })

    model.setCount(44)

    expect(model.getState()).toEqual({ count: 44 })
  })

  it(`should be able to update state by return the new one`, () => {
    class CountModel extends OrchModel<{ count: number }> {
      setCount = mutation(this, (_, count: number) => ({ count }))
    }

    const model = new CountModel({ count: 0 })

    model.setCount(44)

    expect(model.getState()).toEqual({ count: 44 })
  })

  it(`should keep working after error`, () => {
    class CountModel extends OrchModel<{ count: number }> {
      setCount = mutation(this, (_, count: number) => {
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
    class CountModel extends OrchModel<{ count: number }> {
      add = mutation(this, (_, a: number, b: number) => ({ count: a + b }))
    }

    const model = new CountModel({ count: 0 })

    model.add(1, 2)

    expect(model.getState()).toEqual({ count: 3 })
  })
})
