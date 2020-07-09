import { OrchState } from '../src'
import { SetStateSymbol } from '../src/const'

describe(`OrchState`, () => {
  let state: OrchState<{ count: number }>

  beforeEach(() => {
    state = new OrchState({ count: 0 })
  })

  describe(`getState`, () => {
    it(`should return current state`, () => {
      expect(state.getState()).toEqual({ count: 0 })
    })

    it(`should not able to mutate returned state`, () => {
      const currentState = state.getState()

      expect(() => (currentState.count = 44)).toThrow()
      expect(currentState).toEqual({ count: 0 })
      expect(state.getState()).toEqual({ count: 0 })
    })
  })

  describe(`setState`, () => {
    it(`should replace current state`, () => {
      state[SetStateSymbol]({ count: 50 })
      expect(state.getState()).toEqual({ count: 50 })
    })
  })

  describe(`state$`, () => {
    it(`should emit current state`, () => {
      const spy = jest.fn()

      state.state$.subscribe(spy)

      expect(spy.mock.calls).toEqual([[{ count: 0 }]])
    })

    it(`should emit new state after calling setState`, () => {
      const spy = jest.fn()

      state.state$.subscribe(spy)

      state[SetStateSymbol]({ count: 44 })

      expect(spy.mock.calls).toEqual([[{ count: 0 }], [{ count: 44 }]])
    })
  })

  describe(`deriveState`, () => {
    it(`should use the derived state as getState result`, () => {
      const dState = new OrchState<{ count: number }, { doubleCount: number }>(
        { count: 1 },
        (state) => ({ ...state, doubleCount: state.count * 2 }),
      )

      expect(dState.getState()).toEqual({ count: 1, doubleCount: 2 })
    })

    it(`should update derived state after setState`, () => {
      const dState = new OrchState<{ count: number }, { doubleCount: number }>(
        { count: 1 },
        (state) => ({ ...state, doubleCount: state.count * 2 }),
      )

      dState[SetStateSymbol]({ count: 4 })
      expect(dState.getState()).toEqual({ count: 4, doubleCount: 8 })
    })

    it(`should throw error if try to mutate state inside deriveState func`, () => {
      const dState = new OrchState<{ count: number }, { doubleCount: number }>(
        { count: 1 },
        (state) => {
          if (state.count < 1) {
            state.count = 1
          }

          return { ...state, doubleCount: state.count * 2 }
        },
      )

      expect(() => {
        dState[SetStateSymbol]({ count: 0 })
      }).toThrow()
    })

    it(`should not able to mutate state inside deriveState func`, () => {
      const dState = new OrchState<{ count: number }, { doubleCount: number }>(
        { count: 1 },
        (state) => {
          if (state.count < 1) {
            state.count = 1
          }

          return { ...state, doubleCount: state.count * 2 }
        },
      )

      try {
        dState[SetStateSymbol]({ count: 0 })
      } catch {}

      expect(dState.getState()).toEqual({ count: 1, doubleCount: 2 })
    })
  })

  describe(`dispose`, () => {
    it(`should not able to update state after dispose`, () => {
      state.dispose()

      expect(() => state[SetStateSymbol]({ count: 44 })).toThrow()
      expect(state.getState()).toEqual({ count: 0 })
    })

    it(`should not emit new state after dispose`, () => {
      const spy = jest.fn()

      state.state$.subscribe(spy)

      state.dispose()

      expect(() => state[SetStateSymbol]({ count: 44 })).toThrow()
      expect(spy.mock.calls).toEqual([[{ count: 0 }]])
    })
  })

  describe(`isDisposed`, () => {
    it(`should return false if not calling dispose`, () => {
      expect(state.isDisposed).toBe(false)
    })

    it(`should return true after calling dispose`, () => {
      state.dispose()
      expect(state.isDisposed).toBe(true)
    })
  })
})
