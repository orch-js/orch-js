import { describe, expect, it, vi } from 'vitest'

import { activate, deactivate, mutation, OrchModel } from '../src'

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

  describe('status', () => {
    it('should be "initialized" by default', () => {
      expect(new CountModel({ count: 1 }).status).toBe('initialized')
    })

    it('should be "active" after the model has been activated from "initialized"', () => {
      const model = new CountModel({ count: 2 })

      activate(model)

      expect(model.status).toBe('active')
    })

    it('should be "active" after the model has been activated from "inactive"', () => {
      const model = new CountModel({ count: 2 })

      deactivate(model)
      activate(model)

      expect(model.status).toBe('active')
    })

    it('should be "inactive" after the model has been deactivated from "initialized"', () => {
      const model = new CountModel({ count: 2 })

      deactivate(model)

      expect(model.status).toBe('inactive')
    })

    it('should be "inactive" after the model has been deactivated from "active"', () => {
      const model = new CountModel({ count: 2 })

      activate(model)
      deactivate(model)

      expect(model.status).toBe('inactive')
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

        activate(model)
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

        activate(model)
        unsubscribe()
        model.setCount(1)

        expect(spy).toHaveBeenCalledTimes(0)
      })
    })

    describe(`inactive`, () => {
      it(`should be triggered while disposing of the model from "initialized" status`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()

        model.on.deactivate(spy)
        deactivate(model)

        expect(spy).toHaveBeenCalledTimes(1)
      })

      it(`should be triggered while disposing of the model from "active" status`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()

        model.on.deactivate(spy)
        activate(model)
        deactivate(model)

        expect(spy).toHaveBeenCalledTimes(1)
      })

      it(`should not be triggered multiple times if the model is already inactive`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()

        deactivate(model)
        model.on.deactivate(spy)
        expect(spy).toHaveBeenCalledTimes(0)

        deactivate(model)
        expect(spy).toHaveBeenCalledTimes(0)
      })

      it(`should return a function to unsubscribe`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()
        const unsubscribe = model.on.deactivate(spy)

        unsubscribe()
        deactivate(model)

        expect(spy).toHaveBeenCalledTimes(0)
      })
    })

    describe(`active`, () => {
      it(`should be triggered when activating the model`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()

        model.on.activate(spy)
        expect(spy).toHaveBeenCalledTimes(0)

        activate(model)
        expect(spy).toHaveBeenCalledTimes(1)
      })

      it(`should be triggered if the model has been deactivated is set up again`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()

        model.on.activate(spy)
        expect(spy).toHaveBeenCalledTimes(0)

        activate(model)
        deactivate(model)
        activate(model)
        expect(spy).toHaveBeenCalledTimes(2)
      })

      it(`should not be triggered multiple times if the model is already active`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()

        activate(model)
        model.on.activate(spy)
        expect(spy).toHaveBeenCalledTimes(0)

        activate(model)
        expect(spy).toHaveBeenCalledTimes(0)
      })

      it(`should return a function to unsubscribe`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()
        const unsubscribe = model.on.activate(spy)

        unsubscribe()
        deactivate(model)
        activate(model)

        expect(spy).toHaveBeenCalledTimes(0)
      })
    })
  })
})
