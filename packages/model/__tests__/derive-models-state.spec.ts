import { OrchModel, deriveModelsState, OrchState } from '../src'
import { SetStateSymbol } from '../src/const'

describe(`derive-models-state`, () => {
  let nameModel: OrchModel<{ name: string }>
  let countModel: OrchModel<{ count: number }>

  beforeEach(() => {
    nameModel = new OrchModel({ name: 'test' })
    countModel = new OrchModel({ count: 1 })
  })

  it(`should return a new orchState with derived state`, () => {
    const nameWithCountState = deriveModelsState(
      nameModel,
      countModel,
    )(({ name }, { count }) => ({ nameWithCount: `${name}${count}` }))

    expect(nameWithCountState).toBeInstanceOf(OrchState)
    expect(nameWithCountState.getState()).toEqual({ nameWithCount: 'test1' })
  })

  it(`should response state changes`, () => {
    const nameWithCountState = deriveModelsState(
      nameModel,
      countModel,
    )(({ name }, { count }) => ({ nameWithCount: `${name}${count}` }))

    const spy = jest.fn()

    nameWithCountState.state$.subscribe(spy)
    nameModel.state[SetStateSymbol]({ name: 'new-name' })

    expect(spy.mock.calls).toEqual([[{ nameWithCount: 'test1' }], [{ nameWithCount: 'new-name1' }]])
  })

  it(`should able to dispose`, () => {
    const nameWithCountState = deriveModelsState(
      nameModel,
      countModel,
    )(({ name }, { count }) => ({ nameWithCount: `${name}${count}` }))

    nameWithCountState.dispose()

    nameModel.state[SetStateSymbol]({ name: 'a' })

    expect(nameWithCountState.getState()).toEqual({ nameWithCount: 'test1' })
  })
})
