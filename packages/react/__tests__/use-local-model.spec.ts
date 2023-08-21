import { renderHook } from '@testing-library/react-hooks'
import { renderHook as renderServerHook } from '@testing-library/react-hooks/server'
import { describe, expect, it, vi } from 'vitest'

import { autoActivate, OrchModel } from '@orch/core'

import { useLocalModel } from '../src'

type CountModelState = { count: number }

class CountModel extends OrchModel<CountModelState> {
  constructor(defaultState: CountModelState = { count: 0 }) {
    super(defaultState)
  }
}

@autoActivate()
class AutoActivatedCountModel extends OrchModel<CountModelState> {
  constructor(defaultState: CountModelState = { count: 0 }) {
    super(defaultState)
  }
}

describe(`useLocalModel`, () => {
  it(`should return model instance`, () => {
    const { result } = renderHook(() => useLocalModel(CountModel, []))
    expect(result.current).toBeInstanceOf(CountModel)
  })

  it('should automatically activate model', () => {
    const { result } = renderHook(() => useLocalModel(CountModel, []))

    expect(result.current.status).toBe('active')
  })

  it("should defer model's activation until useEffect", () => {
    const { result: result1 } = renderServerHook(() => useLocalModel(AutoActivatedCountModel, []))
    const { result: result2 } = renderServerHook(() => useLocalModel(CountModel, []))

    expect(result1.current.status).toBe('initialized')
    expect(result2.current.status).toBe('initialized')
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
    expect(result.current.getState()).toEqual({ count: 44 })
  })

  it(`should deactivate model if unmount`, () => {
    const { result, unmount } = renderHook(() => useLocalModel(CountModel, []))
    const model = result.current
    const spy = vi.fn()

    model.on.deactivate(spy)

    expect(spy).toBeCalledTimes(0)
    unmount()
    expect(spy).toBeCalledTimes(1)
  })

  it(`should deactivate previous model if return new model`, () => {
    const { result, rerender } = renderHook(
      ({ state }: { state?: CountModelState }) => useLocalModel(CountModel, [state]),
      { initialProps: {} },
    )

    const spy = vi.fn()
    const prevModel = result.current

    prevModel.on.deactivate(spy)

    expect(spy).toBeCalledTimes(0)
    rerender({ state: { count: 44 } })
    expect(spy).toBeCalledTimes(1)
  })
})
