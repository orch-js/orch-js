import * as React from 'react'
import { create, act, ReactTestRenderer } from 'react-test-renderer'

import { Model, reducer } from '@orch/model'
import { useRegisterModel, useOrchState, useModel } from '@orch/react'
import { withTempStore } from '@orch/react/test-utils'

type CountState = {
  count: number
}

class CountModel extends Model<CountState> {
  defaultState = { count: 0 }

  increaseCount = reducer<CountState>((state) => {
    state.count += 1
  })
}

const countModel = new CountModel()

const App = withTempStore(
  ({
    caseId,
    renderSpy,
    defaultState,
  }: {
    caseId?: string
    renderSpy?: jest.Mock
    defaultState?: CountState
  }) => {
    const [state, actions] = useModel(CountModel, { caseId, defaultState })

    renderSpy?.()

    return <div data-state={state} onClick={actions.increaseCount} />
  },
)

const AppWithSelector = withTempStore(({ caseId }: { caseId?: string }) => {
  const count = useRegisterModel(countModel, { caseId })
  const state = useOrchState(count, (state) => ({ isZero: state.count === 0 }))

  return <div data-state={state} onClick={count.actions.increaseCount} />
})

const AppSimulateGetDerivedStateFromPropsTest = withTempStore(
  ({ renderTimesSpy, caseId }: { renderTimesSpy: jest.Mock; caseId?: string }) => {
    const count = useRegisterModel(countModel, { caseId })
    const state = useOrchState(count)

    renderTimesSpy()

    if (state.count === 0) {
      count.actions.increaseCount()
    }

    return <div data-state={state} onClick={count.actions.increaseCount} />
  },
)

const getState = (testRenderer: ReactTestRenderer): CountState =>
  testRenderer.root.findByType('div').props['data-state']

const increaseCount = (testRenderer: ReactTestRenderer): void =>
  testRenderer.root.findByType('div').props.onClick()

describe('useModelState', () => {
  it(`should return model's state`, () => {
    const testRenderer = create(<App />)
    expect(getState(testRenderer)).toEqual({ count: 0 })
  })

  it(`should sync state change`, () => {
    const testRenderer = create(<App />)

    act(() => increaseCount(testRenderer))

    expect(getState(testRenderer)).toEqual({ count: 1 })
  })

  it(`should able to using selector to derive a new state`, () => {
    const testRenderer = create(<AppWithSelector />)

    expect(getState(testRenderer)).toEqual({ isZero: true })
  })

  it(`should sync derived state change`, () => {
    const testRenderer = create(<AppWithSelector />)

    act(() => increaseCount(testRenderer))

    expect(getState(testRenderer)).toEqual({ isZero: false })
  })

  it(`should implement getDerivedStateFromProps`, () => {
    const renderTimesSpy = jest.fn()
    const testRenderer = create(
      <AppSimulateGetDerivedStateFromPropsTest renderTimesSpy={renderTimesSpy} />,
    )

    expect(renderTimesSpy.mock.calls.length).toBe(2)
    expect(getState(testRenderer)).toEqual({ count: 1 })
  })

  it(`should not trigger update at first render`, () => {
    const renderSpy = jest.fn()

    create(<App renderSpy={renderSpy} />)

    expect(renderSpy.mock.calls.length).toBe(1)
  })

  it(`should sync state if model changed`, () => {
    const testRenderer = create(<App caseId="1" />)

    testRenderer.update(<App caseId="2" defaultState={{ count: 9 }} />)

    expect(getState(testRenderer)).toEqual({ count: 9 })
  })
})
