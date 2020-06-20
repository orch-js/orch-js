import { OrchState, reducer } from '../../src'

describe(`performers:reducer`, () => {
  let countState: OrchState<{ count: number }>

  beforeEach(() => {
    countState = new OrchState({ count: 0 })
  })

  it(`should be able to update state by mutating the current one`, () => {
    const setCount = reducer({ state: countState }, (state, count: number) => {
      state.count = count
    })

    setCount(44)

    expect(countState.getState()).toEqual({ count: 44 })
  })

  it(`should be able to update state by return the new one`, () => {
    const setCount = reducer({ state: countState }, (_, count: number) => ({ count }))

    setCount(44)

    expect(countState.getState()).toEqual({ count: 44 })
  })
})
