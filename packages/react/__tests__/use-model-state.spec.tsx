import * as React from 'react'
import { create, act, ReactTestRenderer } from 'react-test-renderer'

import { Model, reducer } from '@orch/model'
import { useModelInstance, useModelState } from '@orch/react'

type CountState = {
  count: number
}

class CountModel extends Model<CountState> {
  increaseCount = reducer(this)((state) => {
    state.count += 1
  })
}

const App = ({ defaultState }: { defaultState: CountState }) => {
  const countModel = useModelInstance(CountModel, [defaultState])
  const state = useModelState(countModel)

  return <div data-state={state} onClick={countModel.increaseCount} />
}

const AppDerivedStateTest = ({
  defaultState,
  renderTimesSpy,
}: {
  defaultState: CountState
  renderTimesSpy: jest.Mock
}) => {
  const countModel = useModelInstance(CountModel, [defaultState])
  const state = useModelState(countModel)

  renderTimesSpy()

  if (state.count === 0) {
    countModel.increaseCount()
  }

  return <div data-state={state} onClick={countModel.increaseCount} />
}

const getState = (testRenderer: ReactTestRenderer): CountState =>
  testRenderer.root.findByType('div').props['data-state']

const increaseCount = (testRenderer: ReactTestRenderer): void =>
  testRenderer.root.findByType('div').props.onClick()

describe('useModelState', () => {
  it(`should return model's state`, () => {
    const testRenderer = create(<App defaultState={{ count: 2 }} />)
    expect(getState(testRenderer)).toEqual({ count: 2 })
  })

  it(`should sync state change`, () => {
    const testRenderer = create(<App defaultState={{ count: 0 }} />)

    act(() => increaseCount(testRenderer))

    expect(getState(testRenderer)).toEqual({ count: 1 })
  })

  it(`should implement getDerivedStateFromProps`, () => {
    const renderTimesSpy = jest.fn()
    const testRenderer = create(
      <AppDerivedStateTest defaultState={{ count: 0 }} renderTimesSpy={renderTimesSpy} />,
    )

    expect(renderTimesSpy.mock.calls.length).toBe(2)
    expect(getState(testRenderer)).toEqual({ count: 1 })
  })
})
