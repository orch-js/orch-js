import * as React from 'react'
import { create, ReactTestRenderer } from 'react-test-renderer'

import { Model } from '@orch/model'
import { ContextModelProvider, useContextModel, useModelInstance } from '@orch/react'

type CountState = {
  count: number
}

class CountModel extends Model<CountState> {
  defaultState = { count: 0 }
}

type CommonProps = {
  id: string
}

type AppProps = CommonProps & {
  defaultState: CountState
  children: React.ReactNode
}

const App = ({ defaultState, children, id }: AppProps) => {
  const countModel = useModelInstance(CountModel, [], defaultState)
  return (
    <ContextModelProvider data-id={id} model={countModel}>
      {children}
    </ContextModelProvider>
  )
}

const Child = ({ id }: CommonProps) => {
  const model = useContextModel(CountModel)
  return <div data-id={id} data-model={model} />
}

const getAppModel = (testRenderer: ReactTestRenderer, id: CommonProps['id']): CountModel =>
  testRenderer.root.findByProps({ ['data-id']: id }).props['model']

const getChildModel = (testRenderer: ReactTestRenderer, id: CommonProps['id']): CountModel =>
  testRenderer.root.findByProps({ ['data-id']: id }).props['data-model']

describe(`ContextModel`, () => {
  it(`should return identical model instance`, () => {
    const defaultState: CountState = { count: 0 }
    const testRenderer = create(
      <App defaultState={defaultState} id="app">
        <Child id="child" />
      </App>,
    )

    expect(getAppModel(testRenderer, 'app')).toBeInstanceOf(CountModel)
    expect(getAppModel(testRenderer, 'app')).toBe(getChildModel(testRenderer, 'child'))
  })

  it(`should throw error if there is no provider`, () => {
    const errorLogSpy = jest.spyOn(console, 'error')

    // hide unnecessary error log
    errorLogSpy.mockImplementation(() => {})
    expect(() => create(<Child id="child" />)).toThrow()
    errorLogSpy.mockRestore()
  })

  it(`should able to work with nesting provider`, () => {
    const defaultState: CountState = { count: 0 }
    const testRenderer = create(
      <App defaultState={defaultState} id="app-1">
        <Child id="child-1" />
        <App defaultState={defaultState} id="app-2">
          <Child id="child-2" />
        </App>
      </App>,
    )

    expect(getAppModel(testRenderer, 'app-1')).toBeInstanceOf(CountModel)
    expect(getAppModel(testRenderer, 'app-1')).toBe(getChildModel(testRenderer, 'child-1'))

    expect(getAppModel(testRenderer, 'app-2')).toBeInstanceOf(CountModel)
    expect(getAppModel(testRenderer, 'app-2')).toBe(getChildModel(testRenderer, 'child-2'))

    expect(getAppModel(testRenderer, 'app-1') !== getAppModel(testRenderer, 'app-2')).toBeTruthy()
  })
})
