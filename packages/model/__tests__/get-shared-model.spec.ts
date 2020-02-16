import { Model, getSharedModel } from '@orch/model'

type CountState = { count: number }

class CountModel extends Model<CountState> {
  defaultState = { count: 0 }
}

class ExtraParamsModel extends Model<CountState> {
  defaultState = { count: 0 }

  constructor(protected readonly id: number) {
    super()
  }
}

describe(`getSharedModel`, () => {
  it(`should return model's instance`, () => {
    const countModel = getSharedModel(CountModel)
    expect(countModel).toBeInstanceOf(CountModel)
  })

  it(`should automatically activate model`, () => {
    const countModel = getSharedModel(CountModel)
    expect(countModel.isActivated).toBeTruthy()
  })

  it(`should always return same instance`, () => {
    const model1 = getSharedModel(CountModel)
    const model2 = getSharedModel(CountModel)

    expect(model1 === model2).toBeTruthy()
  })

  it(`should throw an error if model need extra params`, () => {
    expect(() => {
      getSharedModel(ExtraParamsModel)
    }).toThrow()
  })

  it(`should return a new instance after calling getSharedModel.clear`, () => {
    const model1 = getSharedModel(CountModel)

    getSharedModel.clear()

    const model2 = getSharedModel(CountModel)

    expect(model1 !== model2).toBeTruthy()
  })
})
