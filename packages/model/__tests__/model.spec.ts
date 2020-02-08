import { Subscription } from 'rxjs'
import { debounceTime, map, withLatestFrom } from 'rxjs/operators'

import { Model } from '@orch/model'

type CountState = {
  count: number
}

class CountModel extends Model<CountState> {
  setCount = this.reducer<number>((state, count) => {
    state.count = count
  })

  addTwoCount = this.reducer<void>((state) => {
    state.count += 2
  })

  debounceAddCount = this.effect<number>((count$) =>
    count$.pipe(
      withLatestFrom(this.state$),
      debounceTime(1000),
      map(([count, state]) => this.setCount.asAction(state.count + count)),
    ),
  )

  setCountAndThrowErrorIf4 = this.effect<number>((payload$) =>
    payload$.pipe(
      map((count) => {
        if (count === 4) {
          throw new Error()
        } else {
          return this.setCount.asAction(count)
        }
      }),
    ),
  )

  setCountButIgnore4 = this.effect<number>((count$) =>
    count$.pipe(
      map((count) => {
        if (count === 4) {
          return this.EMPTY_ACTION
        } else {
          return this.setCount.asAction(count)
        }
      }),
    ),
  )

  fakeActionTest = this.effect<any>((payload$) => payload$)
}

jest.useFakeTimers()

describe('@orch/model', () => {
  let countModel: CountModel
  let state$spy: jest.Mock
  let subscription: Subscription
  let consoleErrorSpy: jest.Mock

  beforeEach(() => {
    state$spy = jest.fn()
    consoleErrorSpy = jest.fn()
    console.error = consoleErrorSpy

    countModel = new CountModel({ count: 0 })
    subscription = countModel.state$.subscribe(state$spy)
  })

  afterEach(() => {
    countModel.dispose()
    subscription.unsubscribe()
  })

  describe('state', () => {
    it('should able to custom default state', () => {
      const model = new CountModel({ count: 100 })
      expect(model.state).toEqual({ count: 100 })
    })

    it('should throw error if mutate state directly', () => {
      // @ts-ignore
      expect(() => (countModel.state['count'] = 10)).toThrow()
      expect(countModel.state.count).toBe(0)
    })
  })

  describe('state$', () => {
    it('should trigger current state at subscribe', () => {
      expect(state$spy.mock.calls).toEqual([[{ count: 0 }]])
    })

    it('should trigger state$ after state update', () => {
      countModel.setCount(20)
      expect(state$spy.mock.calls).toEqual([[{ count: 0 }], [{ count: 20 }]])
    })
  })

  describe('reducer', () => {
    it('should able to use reducer to update state', () => {
      countModel.setCount(10)
      expect(countModel.state).toEqual({ count: 10 })
    })

    it('should able to call without payload if payload is void', () => {
      countModel.addTwoCount()
      expect(countModel.state).toEqual({ count: 2 })
    })
  })

  describe('effect', () => {
    it('should work properly with rxjs', () => {
      countModel.debounceAddCount(4)
      countModel.debounceAddCount(4)

      expect(countModel.state).toEqual({ count: 0 })
      jest.runAllTimers()
      expect(countModel.state).toEqual({ count: 4 })
    })

    it('should catch and log error', () => {
      countModel.setCountAndThrowErrorIf4(4)
      expect(consoleErrorSpy.mock.calls.length).toBe(1)
      expect(countModel.state).toEqual({ count: 0 })

      countModel.setCountAndThrowErrorIf4(9)
      countModel.setCountAndThrowErrorIf4(9)
      expect(countModel.state).toEqual({ count: 9 })
    })

    it('should ignore invalid action', () => {
      const fakeAction = jest.fn()
      countModel.fakeActionTest(fakeAction)
      expect(fakeAction.mock.calls.length).toBe(0)

      // those payloads should not throw error.
      countModel.fakeActionTest({})
      countModel.fakeActionTest(Symbol(''))
      countModel.fakeActionTest(null)
      countModel.fakeActionTest(1)
      countModel.fakeActionTest('0')
      countModel.fakeActionTest(undefined)
      countModel.fakeActionTest(true)
    })

    it('should able to handle EMPTY_ACTION', () => {
      countModel.setCountButIgnore4(4)
      expect(countModel.state).toEqual({ count: 0 })

      countModel.setCountButIgnore4(3)
      expect(countModel.state).toEqual({ count: 3 })
    })
  })

  describe('dispose', () => {
    it('should trigger onDispose callback', () => {
      const disposeSpy = jest.fn()

      countModel.onDispose(disposeSpy)
      countModel.dispose()

      expect(disposeSpy.mock.calls).toEqual([[]])
    })

    it('should not trigger onDispose callback if callback is removed', () => {
      const disposeSpy = jest.fn()
      const cancel = countModel.onDispose(disposeSpy)

      cancel()
      countModel.dispose()

      expect(disposeSpy.mock.calls).toEqual([])
    })

    it('should ignore reducer action after dispose', () => {
      countModel.dispose()
      countModel.setCount(21)

      expect(countModel.state).toEqual({ count: 0 })
    })

    it('should ignore effect action after dispose #1(async action after dispose)', () => {
      countModel.dispose()
      countModel.debounceAddCount(21)
      jest.runAllTimers()

      expect(countModel.state).toEqual({ count: 0 })
    })

    it('should ignore effect action after dispose #2(async action before dispose)', () => {
      countModel.debounceAddCount(21)
      countModel.dispose()
      jest.runAllTimers()

      expect(countModel.state).toEqual({ count: 0 })
    })
  })
})
