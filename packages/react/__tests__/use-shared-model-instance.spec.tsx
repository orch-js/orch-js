import * as React from 'react'
import { create, ReactTestRenderer } from 'react-test-renderer'

import { Model, getModelState } from '@orch/model'
import { useSharedModelInstance } from '@orch/react'

type CountState = {
  count: number
}

class CountModel extends Model<CountState> {
  defaultState = { count: 0 }
}

const App = ({ children }: { children?: React.ReactNode }) => {
  const countModel = useSharedModelInstance(CountModel)
  return <div data-model={countModel}>{children}</div>
}

const Child = () => {
  const countModel = useSharedModelInstance(CountModel)
  return <p data-model={countModel} />
}

const getAppModel = (testRenderer: ReactTestRenderer): CountModel =>
  testRenderer.root.findByType('div').props['data-model']

const getChildModel = (testRenderer: ReactTestRenderer): CountModel =>
  testRenderer.root.findByType('p').props['data-model']

describe('useSharedModelInstance', () => {
  it(`should return model instance`, () => {
    const testRenderer = create(<App />)

    expect(getAppModel(testRenderer)).toBeInstanceOf(CountModel)
  })

  it(`should use model's defaultState as default state`, () => {
    const testRenderer = create(<App />)
    const model = getAppModel(testRenderer)

    expect(getModelState(model)).toEqual({ count: 0 })
  })

  it(`should return same instance at each render`, () => {
    const testRenderer = create(<App />)

    const modelInstanceAtFirstRender = getAppModel(testRenderer)

    testRenderer.update(<App />)

    expect(modelInstanceAtFirstRender === getAppModel(testRenderer)).toBeTruthy()
  })

  it(`should return same instance at evey component`, () => {
    const testRenderer = create(
      <App>
        <Child />
      </App>,
    )

    expect(getAppModel(testRenderer) === getChildModel(testRenderer)).toBeTruthy()
  })
})
