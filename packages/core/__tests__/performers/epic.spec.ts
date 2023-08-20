import { debounceTime, endWith, map, startWith } from 'rxjs/operators'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { dispose, epic, mutation, OrchModel, setup } from '../../src'
import { ignoreConsole } from './utils'

class CountModel extends OrchModel<{ count: number }> {
  setCount = mutation(this, (state, count: number) => {
    state.count = count
  })
}

describe(`performers/epic`, () => {
  let model: OrchModel<NonNullable<unknown>>

  beforeEach(() => {
    model = new OrchModel({})
  })

  it(`should handle action properly`, () => {
    vi.useFakeTimers()

    const spy = vi.fn()

    const debounceSpy = epic<string>(model, ({ payload$, action }) =>
      payload$.pipe(action.map(spy), debounceTime(1000)),
    )

    debounceSpy('a')
    debounceSpy('b')
    debounceSpy('c')

    vi.runAllTimers()

    expect(spy.mock.calls).toEqual([['c']])
  })

  it(`should ignore null actions`, () => {
    const spy = vi.fn()

    const _epic = epic<number>(model, ({ payload$, action }) =>
      payload$.pipe(map((num) => (num % 2 ? action(spy, num) : null))),
    )

    _epic(1)
    _epic(2)
    _epic(3)

    expect(spy.mock.calls).toEqual([[1], [3]])
  })

  it(`should keep working after error`, () => {
    const spy = vi.fn()

    const restoreConsole = ignoreConsole()

    const _epic = epic<number>(model, ({ payload$, action }) =>
      payload$.pipe(
        map((num) => {
          if (num % 2 === 0) {
            throw new Error()
          } else {
            return action(spy, num)
          }
        }),
      ),
    )

    _epic(0)
    _epic(1)

    expect(spy.mock.calls).toEqual([[1]])

    restoreConsole()
  })

  it(`should complete payload$ after it is disposed`, () => {
    const spy = vi.fn()

    epic<number>(model, ({ payload$, action }) =>
      payload$.pipe(
        endWith('end'),
        map((value) => action(spy, value)),
      ),
    )

    dispose(model)

    expect(spy.mock.calls).toEqual([['end']])
  })

  it(`should catch and re-subscribe when error`, () => {
    const restoreConsole = ignoreConsole()
    const spy = vi.fn()

    const _epic = epic<string>(model, ({ payload$, action }) =>
      payload$.pipe(
        startWith('a'),
        map((str) => {
          if (str === 'b') {
            throw new Error()
          } else {
            return str
          }
        }),
        action.map(spy),
      ),
    )

    _epic('b')
    _epic('c')

    expect(spy.mock.calls).toEqual([['a'], ['a'], ['c']])

    restoreConsole()
  })

  describe(`state$`, () => {
    it(`should convert model's state to observable`, () => {
      const spy = vi.fn()

      const model = new CountModel({ count: 0 })

      epic<string>(model, ({ action, state$ }) => state$(model).pipe(action.map(spy)))

      expect(spy.mock.calls).toEqual([[{ count: 0 }]])

      model.setCount(2)

      expect(spy.mock.calls).toEqual([[{ count: 0 }], [{ count: 2 }]])

      dispose(model)
      setup(model)

      expect(spy.mock.calls).toEqual([[{ count: 0 }], [{ count: 2 }], [{ count: 2 }]])
    })
  })
})
