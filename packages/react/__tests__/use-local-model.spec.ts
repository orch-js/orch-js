import { renderHook } from '@testing-library/react-hooks'
import { describe, expect, it, vi } from 'vitest'

import { OrchModel, subscribe } from '@orch/core'

import { useLocalModel } from '../src'

type CountModelState = { count: number }

class CountModel extends OrchModel<CountModelState> {
  constructor(defaultState: CountModelState = { count: 0 }) {
    super(defaultState)
  }
}

describe(`useLocalModel`, () => {
  it(`should return model instance`, () => {
    const { result } = renderHook(() => useLocalModel(CountModel, []))
    expect(result.current).toBeInstanceOf(CountModel)
  })

  it(`should return same model at each render if params not change`, () => {
    const { result, rerender } = renderHook(() => useLocalModel(CountModel, []))

    const prevModel = result.current

    rerender()

    expect(prevModel).toBe(result.current)
  })

  it(`should return new model if params changed`, () => {
    const { result, rerender } = renderHook(
      ({ state }: { state?: CountModelState }) => useLocalModel(CountModel, [state]),
      { initialProps: {} },
    )

    const prevModel = result.current

    rerender({ state: { count: 44 } })

    expect(prevModel !== result.current).toBe(true)
    expect(result.current.state).toEqual({ count: 44 })
  })

  it(`should reset model if unmount`, () => {
    const { result, unmount } = renderHook(() => useLocalModel(CountModel, []))
    const model = result.current
    const spy = vi.fn()

    subscribe('reset', model, spy)

    expect(spy).toBeCalledTimes(0)
    unmount()
    expect(spy).toBeCalledTimes(1)
  })

  it(`should reset previous model if return new model`, () => {
    const { result, rerender } = renderHook(
      ({ state }: { state?: CountModelState }) => useLocalModel(CountModel, [state]),
      { initialProps: {} },
    )

    const spy = vi.fn()
    const prevModel = result.current

    subscribe('reset', prevModel, spy)

    expect(spy).toBeCalledTimes(0)
    rerender({ state: { count: 44 } })
    expect(spy).toBeCalledTimes(1)
  })
})
