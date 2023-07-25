import { describe, expect, it, vi } from 'vitest'

import { disposeModel, OrchModel, preventOthersToDisposeModel, reducer } from '../src'

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

  describe(`dispose model`, () => {
    it(`should trigger 'beforeDispose'`, () => {
      const spy = vi.fn()

      class ModelToDispose extends OrchModel<{ count: number }> {
        protected beforeDispose() {
          super.beforeDispose()
          spy('beforeDispose')
        }
      }

      const model = new ModelToDispose({ count: 1 })

      disposeModel(model, null)

      expect(spy.mock.calls).toEqual([['beforeDispose']])
    })

    it(`should dispose all models`, () => {
      class TestModel extends OrchModel<{ count: number }> {
        anotherModel = new OrchModel({ name: 'a' })
      }

      const model = new TestModel({ count: 0 })

      disposeModel(model, null)

      expect(model.isDisposed).toBe(true)
      expect(model.anotherModel.isDisposed).toBe(true)
    })

    it(`should dispose all performers`, () => {
      const model = new CountModel({ count: 0 })

      disposeModel(model, null)

      expect(() => model.setCount(20)).toThrow()
      expect(model.state).toEqual({ count: 0 })
    })

    it(`should dispose nested OrchModel`, () => {
      const nameModel = new NameModel('home')

      disposeModel(nameModel, null)

      expect(() => nameModel.updateName('school')).toThrow()
      expect(nameModel.state).toEqual({ name: 'home' })
      expect(nameModel.count.state).toEqual({ count: 4 })
    })
  })

  describe(`preventOthersToDisposeModel`, () => {
    it(`should return lockId if no provide`, () => {
      const model = new OrchModel({ count: 0 })

      const lockId = preventOthersToDisposeModel(model)

      expect(lockId).toBeTruthy()
    })

    it(`should return same lockId if provided`, () => {
      const model = new OrchModel({ count: 0 })

      const lockId = preventOthersToDisposeModel(model, '123')

      expect(lockId).toBe('123')
    })

    it(`should ignore dispose action if lockId is not identical`, () => {
      const model = new OrchModel({ count: 0 })

      preventOthersToDisposeModel(model)
      disposeModel(model, null)

      expect(model.isDisposed).toBe(false)
    })

    it(`should dispose model if lockId is identical`, () => {
      const model = new OrchModel({ count: 0 })
      const lockId = preventOthersToDisposeModel(model)

      disposeModel(model, lockId)

      expect(model.isDisposed).toBe(true)
    })

    it(`should also prevent nested model from dispose`, () => {
      class CountModel extends OrchModel<{ count: number }> {
        nestedModel = new OrchModel<number>(1)
      }

      const model = new CountModel({ count: 2 })

      preventOthersToDisposeModel(model)

      disposeModel(model.nestedModel, null)
      expect(model.nestedModel.isDisposed).toBeFalsy()
    })

    it(`should ignore dispose action if nested model is prevented`, () => {
      class CountModel extends OrchModel<{ count: number }> {
        constructor(public readonly model: OrchModel<any>) {
          super({ count: 0 })
        }
      }

      const modelA = new OrchModel(1)
      const modelB = new CountModel(modelA)

      preventOthersToDisposeModel(modelA)
      disposeModel(modelB, null)

      expect(modelA.isDisposed).toBeFalsy()
      expect(modelB.isDisposed).toBeTruthy()
    })

    it(`should ignore other 'preventOthersToDisposeModel' calling`, () => {
      const model = new OrchModel({ count: 0 })

      const a = preventOthersToDisposeModel(model)
      const b = preventOthersToDisposeModel(model)

      expect(b).toBe(null)

      disposeModel(model, b)
      expect(model.isDisposed).toBeFalsy()

      disposeModel(model, a)
      expect(model.isDisposed).toBeTruthy()
    })
  })

  describe(`current`, () => {
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
      model.setState({ count: 50 })
      expect(model.state).toEqual({ count: 50 })
    })

    it(`should accept a function to mutate current state`, () => {
      const model = new CountModel({ count: 0 })

      model.setState((s) => {
        s.count = 24
      })
      expect(model.state).toEqual({ count: 24 })
    })
  })

  describe(`dispose`, () => {
    it(`should not able to update state after dispose`, () => {
      const model = new CountModel({ count: 0 })

      model.dispose()

      expect(() => model.setState({ count: 44 })).toThrow()
      expect(model.state).toEqual({ count: 0 })
    })

    it(`should not emit new state after dispose`, () => {
      const model = new CountModel({ count: 0 })
      const spy = vi.fn()

      model.onChange(spy)

      model.dispose()

      expect(() => model.setState(() => ({ count: 44 }))).toThrow()
      expect(model.state).toEqual({ count: 0 })
      expect(spy.mock.calls).toEqual([])
    })
  })

  describe(`on`, () => {
    describe(`change`, () => {
      it(`should trigger on:change if state changed`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()

        model.onChange(spy)

        model.setState(() => ({ count: 44 }))
        expect(spy.mock.calls).toEqual([[{ count: 44 }, { count: 0 }]])
      })

      it(`should return a unsubscribe function`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()

        const unsubscribe = model.onChange(spy)

        unsubscribe()

        model.setState(() => ({ count: 44 }))
        expect(spy).toBeCalledTimes(0)
      })
    })

    describe(`dispose`, () => {
      it(`should trigger on:dispose callback after dispose`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()

        model.onDispose(spy)

        model.dispose()

        expect(spy).toBeCalledTimes(1)
      })

      it(`should return a unsubscribe function`, () => {
        const model = new CountModel({ count: 0 })
        const spy = vi.fn()
        const unsubscribe = model.onDispose(spy)

        unsubscribe()
        model.dispose()

        expect(spy).toBeCalledTimes(0)
      })
    })
  })

  describe(`isDisposed`, () => {
    it(`should return false if not calling dispose`, () => {
      const model = new CountModel({ count: 0 })
      expect(model.isDisposed).toBe(false)
    })

    it(`should return true after calling dispose`, () => {
      const model = new CountModel({ count: 0 })
      model.dispose()
      expect(model.isDisposed).toBe(true)
    })
  })
})
