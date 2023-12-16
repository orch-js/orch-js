import { act, renderHook } from '@testing-library/react-hooks'
import React from 'react'
import { create } from 'react-test-renderer'
import { describe, expect, it } from 'vitest'

import { autoActivate, mutation, OrchModel } from '@orch/core'

import { ContextModelProvider, useContextModel } from '../../src'

type CountModelState = { count: number }

@autoActivate()
class CountModel extends OrchModel<CountModelState> {
  constructor(defaultState: CountModelState = { count: 0 }) {
    super(defaultState)
  }

  setCount = mutation(this, (state, payload: number) => {
    state.count = payload
  })
}

describe(`useContextModel`, () => {
  it(`should throw error if no model`, () => {
    const { result } = renderHook(() => useContextModel(CountModel))

    expect(result.error?.message).toBe(`There is no instance for ${CountModel}`)
  })

  it(`should return model instance from context`, () => {
    const model = new CountModel()
    const { result } = renderHook(() => useContextModel(CountModel), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <ContextModelProvider value={[model]}>{children}</ContextModelProvider>
      ),
    })

    expect(result.current).toBe(model)
  })

  it(`should always return nearest value`, () => {
    const modelA = new CountModel({ count: 1 })
    const modelB = new CountModel({ count: 2 })
    const modelC = new CountModel({ count: 3 })
    const modelD = new CountModel({ count: 4 })

    const CountApp = ({ id }: { id: string }) => {
      const model = useContextModel(CountModel)
      return <div data-id={id} data-model={model} />
    }

    const App = () => (
      <ContextModelProvider value={[modelA]}>
        <CountApp id="a" />

        <ContextModelProvider value={[modelB]}>
          <CountApp id="b" />
        </ContextModelProvider>

        <ContextModelProvider value={[modelC]}>
          <CountApp id="c" />

          <ContextModelProvider value={[modelD]}>
            <CountApp id="d" />
          </ContextModelProvider>
        </ContextModelProvider>
      </ContextModelProvider>
    )

    const renderResult = create(<App />)

    const getModelById = (id: string) =>
      renderResult.root.findByProps({ 'data-id': id }).props['data-model']

    expect(getModelById('a')).toBe(modelA)
    expect(getModelById('b')).toBe(modelB)
    expect(getModelById('c')).toBe(modelC)
    expect(getModelById('d')).toBe(modelD)
  })

  it(`should be able to use selector to get the state`, () => {
    const model = new CountModel()
    const { result } = renderHook(
      () => useContextModel(CountModel, (state, model) => [state.count, model], []),
      {
        wrapper: ({ children }: React.PropsWithChildren) => (
          <ContextModelProvider value={[model]}>{children}</ContextModelProvider>
        ),
      },
    )

    expect(result.current[0]).toBe(0)
    expect(result.current[1]).toBe(model)
  })

  it(`should update state if changed`, () => {
    const model = new CountModel()
    const { result } = renderHook(() => useContextModel(CountModel, (state) => state.count, []), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <ContextModelProvider value={[model]}>{children}</ContextModelProvider>
      ),
    })

    expect(result.current).toBe(0)

    act(() => {
      model.setCount(44)
    })

    expect(result.current).toBe(44)
  })

  it(`should be able to specific selector's deps`, () => {
    type WrapperProps = { prefix: string; children?: React.ReactNode }
    const model = new CountModel()
    const { result, rerender } = renderHook(
      ({ prefix }: { prefix: string }) =>
        useContextModel(CountModel, (state) => `${prefix}: ${state.count}`, [prefix]),
      {
        initialProps: { prefix: 'a' },
        wrapper: ({ children }: WrapperProps) => (
          <ContextModelProvider value={[model]}>{children}</ContextModelProvider>
        ),
      },
    )

    expect(result.current).toBe('a: 0')

    rerender({ prefix: 'b' })

    expect(result.current).toBe('b: 0')
  })
})
