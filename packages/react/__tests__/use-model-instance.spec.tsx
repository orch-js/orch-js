import * as React from 'react'
import { create, ReactTestRenderer } from 'react-test-renderer'

import { Model, getModelState } from '@orch/model'
import { useModelInstance } from '@orch/react'

type CountState = {
  count: number
}

class CountModel extends Model<CountState> {
  defaultState = { count: 0 }

  constructor(protected readonly id: number) {
    super()
  }
}

const App = ({ defaultState, id }: { defaultState?: CountState; id: number }) => {
  const countModel = useModelInstance(CountModel, [id], defaultState)
  return <div data-model={countModel} />
}

const getModel = (testRenderer: ReactTestRenderer): CountModel =>
  testRenderer.root.findByType('div').props['data-model']

describe('useModelInstance', () => {
  it(`should return model instance`, () => {
    const testRenderer = create(<App id={1} />)

    expect(getModel(testRenderer)).toBeInstanceOf(CountModel)
  })

  it(`should return same instance at each render if constructor's params didn't change`, () => {
    const testRenderer = create(<App id={0} />)

    const modelInstanceAtFirstRender = getModel(testRenderer)

    testRenderer.update(<App id={0} />)

    expect(modelInstanceAtFirstRender === getModel(testRenderer)).toBeTruthy()
  })

  it(`should return a different instance at each render if params changed`, () => {
    const testRenderer = create(<App id={0} />)

    const modelInstanceAtFirstRender = getModel(testRenderer)

    testRenderer.update(<App id={1} />)

    expect(modelInstanceAtFirstRender !== getModel(testRenderer)).toBeTruthy()
  })

  it(`should return same instance at each render if defaultState changed`, () => {
    const testRenderer = create(<App id={0} defaultState={{ count: 1 }} />)

    const modelInstanceAtFirstRender = getModel(testRenderer)

    testRenderer.update(<App id={0} defaultState={{ count: 2 }} />)

    expect(modelInstanceAtFirstRender === getModel(testRenderer)).toBeTruthy()
  })

  it(`should use newest defaultState if create a new instance`, () => {
    const testRenderer = create(<App id={0} defaultState={{ count: 1 }} />)

    expect(getModelState(getModel(testRenderer))).toEqual({ count: 1 })

    testRenderer.update(<App id={1} defaultState={{ count: 2 }} />)

    expect(getModelState(getModel(testRenderer))).toEqual({ count: 2 })
  })
})
