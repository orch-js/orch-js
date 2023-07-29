import { describe, expect, it, vi } from 'vitest'

import { OrchModel } from '../src'
import { performer } from '../src/performers/performer'

class CountModel extends OrchModel<{ count: number }> {
  setCount = this.reducer((state, payload: number) => {
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

  private setName = this.reducer((state, payload: string) => {
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

      model.on('reset', spy)
      model.reset()

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

      model.reset()

      expect(resetA).toHaveBeenCalledOnce()
      expect(resetB).toHaveBeenCalledOnce()
    })

    it(`should keep subscriptions untouched`, () => {
      const onChange = vi.fn()
      const onReset = vi.fn()

      const model = new CountModel({ count: 0 })

      model.on('change', onChange)
      model.on('reset', onReset)

      model.reset()

      model.setCount(1)
      model.reset()

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

  describe(`on`, () => {
    describe(`change`, () => {
      it(`should trigger on:change if state changed`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()

        model.on('change', spy)
        model.setCount(44)

        expect(spy.mock.calls).toEqual([[{ count: 44 }, { count: 0 }]])
      })

      it(`should return a unsubscribe function`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()

        const unsubscribe = model.on('change', spy)

        unsubscribe()

        model.setCount(44)
        expect(spy).toBeCalledTimes(0)
      })
    })

    describe(`reset`, () => {
      it(`should trigger reset callback after reset`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()

        model.on('reset', spy)
        model.reset()

        expect(spy).toBeCalledTimes(1)
      })

      it(`should return a unsubscribe function`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()
        const unsubscribe = model.on('reset', spy)

        unsubscribe()
        model.reset()

        expect(spy).toBeCalledTimes(0)
      })
    })
  })

  describe(`performers:reducer`, () => {
    it(`should be able to update state by mutating the current one`, () => {
      class CountModel extends OrchModel<{ count: number }> {
        setCount = this.reducer((state, count: number) => {
          state.count = count
        })
      }

      const model = new CountModel({ count: 0 })

      model.setCount(44)

      expect(model.state).toEqual({ count: 44 })
    })

    it(`should be able to update state by return the new one`, () => {
      class CountModel extends OrchModel<{ count: number }> {
        setCount = this.reducer((_, count: number) => ({ count }))
      }

      const model = new CountModel({ count: 0 })

      model.setCount(44)

      expect(model.state).toEqual({ count: 44 })
    })

    it(`should keep working after error`, () => {
      class CountModel extends OrchModel<{ count: number }> {
        setCount = this.reducer((_, count: number) => {
          if (count < 0) {
            throw new Error()
          }

          return { count }
        })
      }

      const model = new CountModel({ count: 0 })

      expect(() => model.setCount(-1)).toThrow()

      model.setCount(55)

      expect(model.state).toEqual({ count: 55 })
    })
  })
})
