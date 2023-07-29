import { describe, expect, it, vi } from 'vitest'

import { OrchModel, reducer } from '../src'
import { reset, setState, subscribe } from '../src/internal-actions'
import { performer } from '../src/performers/performer'

class CountModel extends OrchModel<{ count: number }> {
  setCount = reducer(this, (state, payload: number) => {
    state.count = payload
  })
}

class NameModel extends OrchModel<{ name: string }> {
  count: CountModel

  constructor(name: string) {
    super({ name })
    this.count = new CountModel({ count: name.length })
  }

  updateName(name: string) {
    this.setName(name)
    this.count.setCount(name.length)
  }

  private setName = reducer(this, (state, payload: string) => {
    state.name = payload
  })
}

describe(`OrchModel`, () => {
  it(`should be able to custom default state`, () => {
    const model = new OrchModel({ count: 10 })

    expect(model.state).toEqual({ count: 10 })
  })

  it(`should be able to nest OrchModel`, () => {
    const nameModel = new NameModel('home')

    expect(nameModel.state).toEqual({ name: 'home' })
    expect(nameModel.count.state).toEqual({ count: 4 })

    nameModel.updateName('school')

    expect(nameModel.state).toEqual({ name: 'school' })
    expect(nameModel.count.state).toEqual({ count: 6 })
  })

  describe(`reset model`, () => {
    it(`should trigger 'reset' event`, () => {
      const spy = vi.fn()

      const model = new OrchModel({ count: 1 })

      subscribe('reset', model, spy)
      reset(model)

      expect(spy).toHaveBeenCalledOnce()
    })

    it(`should reset performers as well`, () => {
      const resetA = vi.fn()
      const resetB = vi.fn()

      class Model extends OrchModel<{ count: 0 }> {
        a = performer(() => ({ next() {}, reset: resetA }))
        b = performer(() => ({ next() {}, reset: resetB }))
      }

      const model = new Model({ count: 0 })

      reset(model)

      expect(resetA).toHaveBeenCalledOnce()
      expect(resetB).toHaveBeenCalledOnce()
    })

    it(`should keep subscriptions untouched`, () => {
      const onChange = vi.fn()
      const onReset = vi.fn()

      const model = new OrchModel({ count: 0 })

      subscribe('change', model, onChange)
      subscribe('reset', model, onReset)

      reset(model)

      setState(model, { count: 1 })
      reset(model)

      expect(onChange.mock.calls).toEqual([
        [{ count: 1 }, { count: 0 }],
        [{ count: 0 }, { count: 1 }],
      ])
      expect(onReset).toHaveBeenCalledTimes(2)
    })
  })

  describe(`state`, () => {
    it(`should return current state`, () => {
      const model = new CountModel({ count: 0 })
      expect(model.state).toEqual({ count: 0 })
    })

    it(`should not able to mutate current state`, () => {
      const model = new CountModel({ count: 0 })
      const currentState = model.state

      expect(() => ((currentState as { count: number }).count = 44)).toThrow()
      expect(currentState).toEqual({ count: 0 })
      expect(model.state).toEqual({ count: 0 })
    })
  })

  describe(`setState`, () => {
    it(`should replace current state`, () => {
      const model = new CountModel({ count: 0 })
      setState(model, { count: 50 })
      expect(model.state).toEqual({ count: 50 })
    })

    it(`should accept a function to mutate current state`, () => {
      const model = new CountModel({ count: 0 })

      setState(model, (s) => {
        s.count = 24
      })
      expect(model.state).toEqual({ count: 24 })
    })
  })

  describe(`subscribe`, () => {
    describe(`change`, () => {
      it(`should trigger on:change if state changed`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()

        subscribe('change', model, spy)

        setState(model, () => ({ count: 44 }))
        expect(spy.mock.calls).toEqual([[{ count: 44 }, { count: 0 }]])
      })

      it(`should return a unsubscribe function`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()

        const unsubscribe = subscribe('change', model, spy)

        unsubscribe()

        setState(model, () => ({ count: 44 }))
        expect(spy).toBeCalledTimes(0)
      })
    })

    describe(`reset`, () => {
      it(`should trigger reset callback after reset`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()

        subscribe('reset', model, spy)
        reset(model)

        expect(spy).toBeCalledTimes(1)
      })

      it(`should return a unsubscribe function`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()
        const unsubscribe = subscribe('reset', model, spy)

        unsubscribe()
        reset(model)

        expect(spy).toBeCalledTimes(0)
      })
    })
  })
})
