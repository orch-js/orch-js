import { debounceTime, map } from 'rxjs/operators'
import { describe, expect, it, vi } from 'vitest'

import { action, effect } from '../../src'
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
})
