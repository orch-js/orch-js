import { disposeModel, OrchModel, OrchState, reducer } from '../src'

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

    expect(model.state).toEqual(new OrchState({ count: 10 }))
  })

  it(`should be able to nest OrchModel`, () => {
    const nameModel = new NameModel('home')

    expect(nameModel.state.getState()).toEqual({ name: 'home' })
    expect(nameModel.count.state.getState()).toEqual({ count: 4 })

    nameModel.updateName('school')

    expect(nameModel.state.getState()).toEqual({ name: 'school' })
    expect(nameModel.count.state.getState()).toEqual({ count: 6 })
  })

  describe(`dispose model`, () => {
    it(`should trigger 'beforeDispose'`, () => {
      const spy = jest.fn()

      class ModelToDispose extends OrchModel<number> {
        protected beforeDispose() {
          super.beforeDispose()
          spy('beforeDispose')
        }
      }

      const model = new ModelToDispose(1)

      disposeModel(model)

      expect(spy.mock.calls).toEqual([['beforeDispose']])
    })

    it(`should dispose state`, () => {
      const model = new OrchModel({ count: 0 })

      disposeModel(model)

      expect(model.state.isDisposed).toBe(true)
    })

    it(`should dispose all performers`, () => {
      const model = new CountModel({ count: 0 })

      disposeModel(model)

      model.setCount(20)

      expect(model.state.getState()).toEqual({ count: 0 })
    })

    it(`should dispose nested OrchModel`, () => {
      const nameModel = new NameModel('home')

      disposeModel(nameModel)

      nameModel.updateName('school')

      expect(nameModel.state.getState()).toEqual({ name: 'home' })
      expect(nameModel.count.state.getState()).toEqual({ count: 4 })
    })
  })
})
