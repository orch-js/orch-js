import { renderHook } from '@testing-library/react-hooks'

import { disposeModel, OrchModel } from '@orch/model'

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
    expect(result.current.state.getState()).toEqual({ count: 44 })
  })

  it(`should dispose model if unmount`, () => {
    const { result, unmount } = renderHook(() => useLocalModel(CountModel, []))
    const model = result.current

    expect(model.state.isDisposed).toBe(false)

    unmount()

    expect(model.state.isDisposed).toBe(true)
  })

  it(`should dispose previous model if return new model`, () => {
    const { result, rerender } = renderHook(
      ({ state }: { state?: CountModelState }) => useLocalModel(CountModel, [state]),
      { initialProps: {} },
    )

    const prevModel = result.current

    rerender({ state: { count: 44 } })

    expect(prevModel.state.isDisposed).toBe(true)
  })

  it(`should prevent others to dispose model`, () => {
    const { result } = renderHook(() => useLocalModel(CountModel, []))
    const model = result.current

    disposeModel(model, null)

    expect(model.state.isDisposed).toBeFalsy()
  })
})
