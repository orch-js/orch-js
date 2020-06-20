import { map, debounceTime } from 'rxjs/operators'

import { effect, action } from '../../src'

describe(`performers:effect`, () => {
  it(`should handle action properly`, () => {
    jest.useFakeTimers()

    const spy = jest.fn()

    const debounceSpy = effect<number>((payload$) =>
      payload$.pipe(
        map((payload) => action(spy, payload)),
        debounceTime(500),
      ),
    )

    debounceSpy(1)
    debounceSpy(2)
    debounceSpy(3)

    jest.runAllTimers()

    expect(spy.mock.calls).toEqual([[3]])
  })

  it(`should ignore null actions`, () => {
    const spy = jest.fn()

    const _effect = effect<number>((payload$) =>
      payload$.pipe(map((num) => (num % 2 ? action(spy, num) : null))),
    )

    _effect(1)
    _effect(2)
    _effect(3)

    expect(spy.mock.calls).toEqual([[1], [3]])
  })
})
