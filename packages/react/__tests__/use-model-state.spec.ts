import { act, renderHook } from '@testing-library/react-hooks'
import { beforeEach, describe, expect, it } from 'vitest'

import { OrchModel, reducer } from '@orch/core'

import { useModelState } from '../src'

type CountModelState = { count: number }

class CountModel extends OrchModel<CountModelState> {
  constructor(defaultState: CountModelState = { count: 0 }) {
    super(defaultState)
  }

  setCount = reducer(this, (state, payload: number) => {
    state.count = payload
  })
}

describe(`useModelState`, () => {
  let model: CountModel

  beforeEach(() => {
    model = new CountModel()
  })

  it(`should return current state`, () => {
    const { result } = renderHook(() => useModelState(model))

    expect(result.current).toEqual({ count: 0 })
  })

  it(`should update state if changed`, () => {
    const { result } = renderHook(() => useModelState(model))

    act(() => {
      model.setCount(44)
    })

    expect(result.current).toEqual({ count: 44 })
  })

  it(`should be able to map state`, () => {
    const { result } = renderHook(() =>
      useModelState(model, ({ state }) => `count: ${state.count}`, []),
    )

    expect(result.current).toBe('count: 0')

    act(() => {
      model.setCount(1)
    })

    expect(result.current).toBe('count: 1')
  })

  it(`should be able to specific selector's deps`, () => {
    const { result, rerender } = renderHook(
      ({ prefix }: { prefix: string }) =>
        useModelState(model, ({ state }) => `${prefix}: ${state.count}`, [prefix]),
      { initialProps: { prefix: 'a' } },
    )

    expect(result.current).toBe('a: 0')

    rerender({ prefix: 'b' })

    expect(result.current).toBe('b: 0')
  })
})
