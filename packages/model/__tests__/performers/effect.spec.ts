import { debounceTime, endWith, map, startWith } from 'rxjs/operators'
import { describe, expect, it, vi } from 'vitest'

import { action, effect } from '../../src'
import { disposePerformer } from '../../src/performers/performer'
import { ignoreConsole } from './utils'

describe(`performers`, () => {
  describe(`action`, () => {
    it('should execute the provided function with the provided parameters when called', () => {
      const mockFunc = vi.fn()
      const effectAction = action(mockFunc, 'param1', 'param2')
      effectAction()
      expect(mockFunc).toHaveBeenCalledWith('param1', 'param2')
    })

    it('should return a function that executes the provided function with the provided parameters when the curry method is used', () => {
      const mockFunc = vi.fn()
      const curriedAction = action.curry(mockFunc)
      const effectAction = curriedAction('param1', 'param2')
      effectAction()
      expect(mockFunc).toHaveBeenCalledWith('param1', 'param2')
    })
  })

  describe(`effect`, () => {
    it(`should handle action properly`, () => {
      vi.useFakeTimers()

      const spy = vi.fn()

      const debounceSpy = effect<string>((payload$) =>
        payload$.pipe(map(action.curry(spy)), debounceTime(1000)),
      )

      debounceSpy('a')
      debounceSpy('b')
      debounceSpy('c')

      vi.runAllTimers()

      expect(spy.mock.calls).toEqual([['c', 2]])
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

      const _effect = effect<string>((payload$) =>
        payload$.pipe(
          startWith('a'),
          map((str) => {
            if (str === 'b') {
              throw new Error()
            } else {
              return str
            }
          }),
          map(action.curry(spy)),
        ),
      )

      _effect('b')
      _effect('c')

      expect(spy.mock.calls).toEqual([
        ['a', 0],
        ['a', 0],
        ['c', 1],
      ])

      restoreConsole()
    })
  })
})
