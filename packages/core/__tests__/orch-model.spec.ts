import { describe, expect, it, vi } from 'vitest'

import { disposeModel, OrchModel, OrchState, preventOthersToDisposeModel, reducer } from '../src'

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

    expect(model.state.current).toEqual({ count: 10 })
  })

  it(`should be able to nest OrchModel`, () => {
    const nameModel = new NameModel('home')

    expect(nameModel.state.current).toEqual({ name: 'home' })
    expect(nameModel.count.state.current).toEqual({ count: 4 })

    nameModel.updateName('school')

    expect(nameModel.state.current).toEqual({ name: 'school' })
    expect(nameModel.count.state.current).toEqual({ count: 6 })
  })

  describe(`dispose model`, () => {
    it(`should trigger 'beforeDispose'`, () => {
      const spy = vi.fn()

      class ModelToDispose extends OrchModel<number> {
        protected beforeDispose() {
          super.beforeDispose()
          spy('beforeDispose')
        }
      }

      const model = new ModelToDispose(1)

      disposeModel(model, null)

      expect(spy.mock.calls).toEqual([['beforeDispose']])
    })

    it(`should dispose all states`, () => {
      class TestModel extends OrchModel<{ count: number }> {
        anotherState = new OrchState({ name: 'a' })
      }

      const model = new TestModel({ count: 0 })

      disposeModel(model, null)

      expect(model.state.isDisposed).toBe(true)
      expect(model.anotherState.isDisposed).toBe(true)
    })

    it(`should dispose all performers`, () => {
      const model = new CountModel({ count: 0 })

      disposeModel(model, null)

      expect(() => model.setCount(20)).toThrow()
      expect(model.state.current).toEqual({ count: 0 })
    })

    it(`should dispose nested OrchModel`, () => {
      const nameModel = new NameModel('home')

      disposeModel(nameModel, null)

      expect(() => nameModel.updateName('school')).toThrow()
      expect(nameModel.state.current).toEqual({ name: 'home' })
      expect(nameModel.count.state.current).toEqual({ count: 4 })
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

      expect(model.state.isDisposed).toBe(false)
    })

    it(`should dispose model if lockId is identical`, () => {
      const model = new OrchModel({ count: 0 })
      const lockId = preventOthersToDisposeModel(model)

      disposeModel(model, lockId)

      expect(model.state.isDisposed).toBe(true)
    })

    it(`should also prevent nested model from dispose`, () => {
      class CountModel extends OrchModel<{ count: number }> {
        nestedModel = new OrchModel<number>(1)
      }

      const model = new CountModel({ count: 2 })

      preventOthersToDisposeModel(model)

      disposeModel(model.nestedModel, null)
      expect(model.nestedModel.state.isDisposed).toBeFalsy()
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

      expect(modelA.state.isDisposed).toBeFalsy()
      expect(modelB.state.isDisposed).toBeTruthy()
    })

    it(`should ignore other 'preventOthersToDisposeModel' calling`, () => {
      const model = new OrchModel({ count: 0 })

      const a = preventOthersToDisposeModel(model)
      const b = preventOthersToDisposeModel(model)

      expect(b).toBe(null)

      disposeModel(model, b)
      expect(model.state.isDisposed).toBeFalsy()

      disposeModel(model, a)
      expect(model.state.isDisposed).toBeTruthy()
    })
  })
})
