import * as React from 'react'
import { create, ReactTestRenderer } from 'react-test-renderer'

import { Model } from '@orch/model'
import { useModelInstance } from '@orch/react'

type CountState = {
  count: number
}

class CountModel extends Model<CountState> {}

const App = ({ defaultState }: { defaultState: CountState }) => {
  const countModel = useModelInstance(CountModel, [defaultState])
  return <div data-model={countModel} />
}

const getModel = (testRenderer: ReactTestRenderer): CountModel =>
  testRenderer.root.findByType('div').props['data-model']

describe('useModelInstance', () => {
  it(`should return model instance`, () => {
    const defaultState: CountState = { count: 0 }
    const testRenderer = create(<App defaultState={defaultState} />)

    expect(getModel(testRenderer)).toBeInstanceOf(CountModel)
  })

  it(`should return same instance at each render if params didn't change`, () => {
    const defaultState: CountState = { count: 0 }
    const testRenderer = create(<App defaultState={defaultState} />)

    const modelInstanceAtFirstRender = getModel(testRenderer)

    testRenderer.update(<App defaultState={defaultState} />)

    expect(modelInstanceAtFirstRender === getModel(testRenderer)).toBeTruthy()
  })

  it(`should return same instance at each render if params changed`, () => {
    const testRenderer = create(<App defaultState={{ count: 0 }} />)

    const modelInstanceAtFirstRender = getModel(testRenderer)

    testRenderer.update(<App defaultState={{ count: 0 }} />)

    expect(modelInstanceAtFirstRender !== getModel(testRenderer)).toBeTruthy()
  })
})
