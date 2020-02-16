import { Model, getModel, getModelState } from '@orch/model'

type CountState = { count: number }

class CountModel extends Model<CountState> {
  defaultState = { count: 0 }

  constructor(protected readonly id: number) {
    super()
  }
}

const CountModelId = 0

describe(`getModel`, () => {
  it(`should return model's instance`, () => {
    const countModel = getModel(CountModel, [CountModelId])
    expect(countModel).toBeInstanceOf(CountModel)
  })

  it(`should automatically activate model`, () => {
    const countModel = getModel(CountModel, [CountModelId])
    expect(countModel.isActivated).toBeTruthy()
  })

  it(`should always return a new instance`, () => {
    const model1 = getModel(CountModel, [CountModelId])
    const model2 = getModel(CountModel, [CountModelId])

    expect(model1 !== model2).toBeTruthy()
  })

  it(`should able to custom default state`, () => {
    const model = getModel(CountModel, [CountModelId], { count: 123 })
    expect(getModelState(model)).toEqual({ count: 123 })
  })
})
