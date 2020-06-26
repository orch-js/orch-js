import { OrchState, reducer } from '../../src'
import { ignoreConsole } from './utils'

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

  it(`should keep working after error`, () => {
    const restoreConsole = ignoreConsole()
    const setCount = reducer({ state: countState }, (_, count: number) => {
      if (count < 0) {
        throw new Error()
      }

      return { count }
    })

    setCount(-1)
    setCount(44)

    expect(countState.getState()).toEqual({ count: 44 })
    restoreConsole()
  })
})
