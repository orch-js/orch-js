import { OrchState } from '../src'

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
      state.setState({ count: 50 })
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

      state.setState({ count: 44 })

      expect(spy.mock.calls).toEqual([[{ count: 0 }], [{ count: 44 }]])
    })
  })

  describe(`dispose`, () => {
    it(`should not able to update state after dispose`, () => {
      state.dispose()

      expect(() => state.setState({ count: 44 })).toThrow()
      expect(state.getState()).toEqual({ count: 0 })
    })

    it(`should not emit new state after dispose`, () => {
      const spy = jest.fn()

      state.state$.subscribe(spy)

      state.dispose()

      expect(() => state.setState({ count: 44 })).toThrow()
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
