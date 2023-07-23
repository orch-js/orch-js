import { debounceTime, endWith, map, startWith } from 'rxjs/operators'
import { describe, expect, it, vi } from 'vitest'

import { action, effect } from '../../src'
import { disposePerformer } from '../../src/performers/performer'
import { ignoreConsole } from './utils'

describe(`performers:effect`, () => {
  it(`should handle action properly`, () => {
    vi.useFakeTimers()

    const spy = vi.fn()

    const debounceSpy = effect<number>((payload$) =>
      payload$.pipe(
        map((payload) => action(spy, payload)),
        debounceTime(500),
      ),
    )

    debounceSpy(1)
    debounceSpy(2)
    debounceSpy(3)

    vi.runAllTimers()

    expect(spy.mock.calls).toEqual([[3]])
  })

  it(`should ignore null actions`, () => {
    const spy = vi.fn()

    const _effect = effect<number>((payload$) =>
      payload$.pipe(map((num) => (num % 2 ? action(spy, num) : null))),
    )

    _effect(1)
    _effect(2)
    _effect(3)

    expect(spy.mock.calls).toEqual([[1], [3]])
  })

  it(`should keep working after error`, () => {
    const spy = vi.fn()

    const restoreConsole = ignoreConsole()

    const _effect = effect<number>((payload$) =>
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

    _effect(0)
    _effect(1)

    expect(spy.mock.calls).toEqual([[1]])

    restoreConsole()
  })

  it(`should complete payload$ after it is disposed`, () => {
    const spy = vi.fn()

    const _performer = effect<number>((payload$) =>
      payload$.pipe(
        endWith('end'),
        map((value) => action(spy, value)),
      ),
    )

    disposePerformer(_performer)

    expect(spy.mock.calls).toEqual([['end']])
  })

  it(`should catch and re-subscribe when error`, () => {
    const restoreConsole = ignoreConsole()
    const spy = vi.fn()

    const _effect = effect<number>((payload$) =>
      payload$.pipe(
        startWith(0),
        map((num) => {
          if (num % 2 === 0) {
            return num
          } else {
            throw new Error()
          }
        }),
        map((value) => action(spy, value)),
      ),
    )

    _effect(1)
    _effect(2)

    expect(spy.mock.calls).toEqual([[0], [0], [2]])

    restoreConsole()
  })
})
