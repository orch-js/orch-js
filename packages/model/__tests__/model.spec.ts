import { Subscription } from 'rxjs'
import { debounceTime, map, withLatestFrom } from 'rxjs/operators'

import {
  Model,
  effect,
  reducer,
  EMPTY_ACTION,
  getModelState,
  ModelActions,
  modelToOrch,
} from '@orch/model'

type CountState = {
  count: number
}

class CountModel extends Model<CountState> {
  defaultState = { count: 0 }

  setCount = reducer(this)<number>((state, count) => {
    state.count = count
  })

  addTwoCount = reducer(this)((state) => {
    state.count += 2
  })

  debounceAddCount = effect(this)<number>((count$) =>
    count$.pipe(
      withLatestFrom(this.state$),
      debounceTime(1000),
      map(([count, state]) => this.setCount.asAction(state.count + count)),
    ),
  )

  setCountAndThrowErrorIf4 = effect(this)<number>((payload$) =>
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

  setCountButIgnore4 = effect(this)<number>((count$) =>
    count$.pipe(
      map((count) => {
        if (count === 4) {
          return EMPTY_ACTION
        } else {
          return this.setCount.asAction(count)
        }
      }),
    ),
  )

  fakeActionTest = effect(this)<any>((payload$) => payload$)
}

jest.useFakeTimers()

describe('@orch/model', () => {
  let countModel: CountModel
  let state$spy: jest.Mock
  let subscription: Subscription
  let consoleErrorSpy: jest.Mock
  let actions: ModelActions<CountModel>

  beforeEach(() => {
    state$spy = jest.fn()
    consoleErrorSpy = jest.fn()
    console.error = consoleErrorSpy

    countModel = new CountModel()
    countModel.activateModel()
    subscription = countModel.state$.subscribe(state$spy)

    modelToOrch(countModel).state.state
  })

  afterEach(() => {
    countModel.disposeModel()
    subscription.unsubscribe()
  })

  describe(`activateModel`, () => {
    it(`should not able to get state if model is not active`, () => {
      const model = new CountModel()
      expect(getModelState(model)).toBe(null)
    })

    it(`should able to get state if model is active`, () => {
      const model = new CountModel()
      model.activateModel()
      expect(getModelState(model)).toEqual({ count: 0 })
    })

    it('should able to specify default state', () => {
      const model = new CountModel()
      model.activateModel({ count: 100 })
      expect(getModelState(model)).toEqual({ count: 100 })
    })
  })

  describe(`isActivated`, () => {
    it(`should return 'false' before calling 'activateModel'`, () => {
      const countModel = new CountModel()
      expect(countModel.isActivated).toBe(false)
    })

    it(`should return 'true' after calling 'activateModel'`, () => {
      const countModel = new CountModel()
      countModel.activateModel()
      expect(countModel.isActivated).toBe(true)
    })

    it(`it should not being affected by 'disposeModel'`, () => {
      const countModel = new CountModel()
      expect(countModel.isActivated).toBe(false)
      countModel.activateModel()
      expect(countModel.isActivated).toBe(true)
      countModel.disposeModel()
      expect(countModel.isActivated).toBe(true)
    })
  })

  describe('state', () => {
    it('should throw error if mutate state directly', () => {
      const state = getModelState(countModel)
      expect(() => state && (state.count = 10)).toThrow()
      expect(state?.count).toBe(0)
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
    it(`should be omitted if model not activated`, () => {
      const countModel = new CountModel()
      countModel.setCount(5)
      expect(getModelState(countModel)).toBe(null)
    })

    it('should able to use reducer to update state', () => {
      countModel.setCount(10)
      expect(getModelState(countModel)).toEqual({ count: 10 })
    })

    it('should able to call without payload if payload is void', () => {
      countModel.addTwoCount()
      expect(getModelState(countModel)).toEqual({ count: 2 })
    })
  })

  describe('effect', () => {
    it(`should be omitted if model not activated`, () => {
      const countModel = new CountModel()
      countModel.debounceAddCount(5)
      jest.runAllTimers()
      expect(getModelState(countModel)).toBe(null)
    })

    it('should work properly with rxjs', () => {
      countModel.debounceAddCount(4)
      countModel.debounceAddCount(4)

      expect(getModelState(countModel)).toEqual({ count: 0 })
      jest.runAllTimers()
      expect(getModelState(countModel)).toEqual({ count: 4 })
    })

    it('should catch and log error', () => {
      countModel.setCountAndThrowErrorIf4(4)
      expect(consoleErrorSpy.mock.calls.length).toBe(1)
      expect(getModelState(countModel)).toEqual({ count: 0 })

      countModel.setCountAndThrowErrorIf4(9)
      countModel.setCountAndThrowErrorIf4(9)
      expect(getModelState(countModel)).toEqual({ count: 9 })
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
      expect(getModelState(countModel)).toEqual({ count: 0 })

      countModel.setCountButIgnore4(3)
      expect(getModelState(countModel)).toEqual({ count: 3 })
    })
  })

  describe('disposeModel', () => {
    it('should trigger onDispose callback', () => {
      const disposeSpy = jest.fn()

      countModel.onModelDispose(disposeSpy)
      countModel.disposeModel()

      expect(disposeSpy.mock.calls).toEqual([[]])
    })

    it('should not trigger onDispose callback if callback is removed', () => {
      const disposeSpy = jest.fn()
      const cancel = countModel.onModelDispose(disposeSpy)

      cancel()
      countModel.disposeModel()

      expect(disposeSpy.mock.calls).toEqual([])
    })

    it('should ignore reducer action after dispose', () => {
      countModel.disposeModel()
      countModel.setCount(21)

      expect(getModelState(countModel)).toEqual({ count: 0 })
    })

    it('should ignore effect action after dispose #1(async action after dispose)', () => {
      countModel.disposeModel()
      countModel.debounceAddCount(21)
      jest.runAllTimers()

      expect(getModelState(countModel)).toEqual({ count: 0 })
    })

    it('should ignore effect action after dispose #2(async action before dispose)', () => {
      countModel.debounceAddCount(21)
      countModel.disposeModel()
      jest.runAllTimers()

      expect(getModelState(countModel)).toEqual({ count: 0 })
    })
  })

  describe(`isDisposed`, () => {
    it(`should return 'false' before calling 'disposeModel'`, () => {
      const countModel = new CountModel()
      expect(countModel.isDisposed).toBe(false)
    })

    it(`should return 'true' after calling 'disposeModel'`, () => {
      const countModel = new CountModel()
      countModel.disposeModel()
      expect(countModel.isDisposed).toBe(true)
    })

    it(`it should not being affected by 'activateModel'`, () => {
      const countModel = new CountModel()
      expect(countModel.isDisposed).toBe(false)
      countModel.activateModel()
      expect(countModel.isDisposed).toBe(false)
      countModel.disposeModel()
      expect(countModel.isDisposed).toBe(true)
    })
  })
})
