import { describe, expect, it, vi } from 'vitest'

import { dispose, mutation, OrchModel, setup } from '../src'

class CountModel extends OrchModel<{ count: number }> {
  setCount = mutation(this, (state, payload: number) => {
    state.count = payload
  })
}

describe(`OrchModel`, () => {
  it(`should be able to custom default state`, () => {
    const model = new CountModel({ count: 10 })

    expect(model.getState()).toEqual({ count: 10 })
  })

  describe('isDisposed', () => {
    it('should be false by default', () => {
      expect(new CountModel({ count: 1 }).isDisposed).toBe(false)
    })

    it('should be true after the model has been disposed', () => {
      const model = new CountModel({ count: 2 })

      dispose(model)

      expect(model.isDisposed).toBe(true)
    })

    it('should be false if the model has been disposed of is set up again', () => {
      const model = new CountModel({ count: 2 })

      dispose(model)
      setup(model)

      expect(model.isDisposed).toBe(false)
    })
  })

  describe(`getState`, () => {
    it(`should return current state`, () => {
      const model = new CountModel({ count: 0 })
      expect(model.getState()).toEqual({ count: 0 })
    })
  })

  describe(`on`, () => {
    describe(`change`, () => {
      it(`should be triggered only when the state has changed after subscribing`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()

        model.on.change(spy)
        model.setCount(1)

        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith(
          { count: 1 }, // Current State
          { count: 0 }, // Previous State
        )
      })

      it(`should return a function to unsubscribe`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()
        const unsubscribe = model.on.change(spy)

        unsubscribe()
        model.setCount(1)

        expect(spy).toHaveBeenCalledTimes(0)
      })
    })

    describe(`dispose`, () => {
      it(`should be triggered while disposing of the model`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()

        model.on.dispose(spy)
        dispose(model)

        expect(spy).toHaveBeenCalledTimes(1)
      })

      it(`should return a function to unsubscribe`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()
        const unsubscribe = model.on.dispose(spy)

        unsubscribe()
        dispose(model)

        expect(spy).toHaveBeenCalledTimes(0)
      })
    })

    describe(`setup`, () => {
      it(`should be triggered if the model has been disposed of is set up again`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()

        model.on.setup(spy)
        expect(spy).toHaveBeenCalledTimes(0)

        dispose(model)
        setup(model)
        expect(spy).toHaveBeenCalledTimes(1)
      })

      it(`should return a function to unsubscribe`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()
        const unsubscribe = model.on.setup(spy)

        unsubscribe()
        dispose(model)
        setup(model)

        expect(spy).toHaveBeenCalledTimes(0)
      })
    })
  })
})
