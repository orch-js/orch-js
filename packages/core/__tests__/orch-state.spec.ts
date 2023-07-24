import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OrchState } from '../src'

describe(`OrchState`, () => {
  let state: OrchState<{ count: number }>

  beforeEach(() => {
    state = new OrchState({ count: 0 })
  })

  describe(`current`, () => {
    it(`should return current state`, () => {
      expect(state.current).toEqual({ count: 0 })
    })

    it(`should not able to mutate current state`, () => {
      const currentState = state.current

      expect(() => ((currentState as { count: number }).count = 44)).toThrow()
      expect(currentState).toEqual({ count: 0 })
      expect(state.current).toEqual({ count: 0 })
    })
  })

  describe(`setState`, () => {
    it(`should replace current state`, () => {
      state.setState(() => ({ count: 50 }))
      expect(state.current).toEqual({ count: 50 })
    })
  })

  describe(`dispose`, () => {
    it(`should not able to update state after dispose`, () => {
      state.dispose()

      expect(() => state.setState({ count: 44 })).toThrow()
      expect(state.current).toEqual({ count: 0 })
    })

    it(`should not emit new state after dispose`, () => {
      const spy = vi.fn()

      state.onChange(spy)

      state.dispose()

      expect(() => state.setState(() => ({ count: 44 }))).toThrow()
      expect(state.current).toEqual({ count: 0 })
      expect(spy.mock.calls).toEqual([])
    })
  })

  describe(`on`, () => {
    describe(`change`, () => {
      it(`should trigger on:change if state changed`, () => {
        const spy = vi.fn()

        state.onChange(spy)

        state.setState(() => ({ count: 44 }))
        expect(spy.mock.calls).toEqual([[{ count: 44 }, { count: 0 }]])
      })

      it(`should return a unsubscribe function`, () => {
        const spy = vi.fn()

        const unsubscribe = state.onChange(spy)

        unsubscribe()

        state.setState(() => ({ count: 44 }))
        expect(spy).toBeCalledTimes(0)
      })
    })

    describe(`dispose`, () => {
      it(`should trigger on:dispose callback after dispose`, () => {
        const spy = vi.fn()

        state.onDispose(spy)

        state.dispose()

        expect(spy).toBeCalledTimes(1)
      })

      it(`should return a unsubscribe function`, () => {
        const spy = vi.fn()
        const unsubscribe = state.onDispose(spy)

        unsubscribe()
        state.dispose()

        expect(spy).toBeCalledTimes(0)
      })
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
