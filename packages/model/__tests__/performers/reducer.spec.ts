import { describe, it, expect, beforeEach } from 'vitest'

import { OrchModel, reducer } from '../../src'
import { ignoreConsole } from './utils'

describe(`performers:reducer`, () => {
  let countModel: OrchModel<{ count: number }>

  beforeEach(() => {
    countModel = new OrchModel({ count: 0 })
  })

  it(`should be able to update state by mutating the current one`, () => {
    const setCount = reducer(countModel, (state, count: number) => {
      state.count = count
    })

    setCount(44)

    expect(countModel.state.getState()).toEqual({ count: 44 })
  })

  it(`should be able to update state by return the new one`, () => {
    const setCount = reducer(countModel, (_, count: number) => ({ count }))

    setCount(44)

    expect(countModel.state.getState()).toEqual({ count: 44 })
  })

  it(`should keep working after error`, () => {
    const restoreConsole = ignoreConsole()
    const setCount = reducer(countModel, (_, count: number) => {
      if (count < 0) {
        throw new Error()
      }

      return { count }
    })

    setCount(-1)
    setCount(44)

    expect(countModel.state.getState()).toEqual({ count: 44 })
    restoreConsole()
  })
})
