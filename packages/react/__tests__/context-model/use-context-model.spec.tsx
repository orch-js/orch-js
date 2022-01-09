import { renderHook } from '@testing-library/react-hooks'
import { create } from 'react-test-renderer'
import React from 'react'

import { OrchModel } from '@orch/model'

import { useContextModel, ContextModelProvider } from '../../src'

type CountModelState = { count: number }

class CountModel extends OrchModel<CountModelState> {
  constructor(defaultState: CountModelState = { count: 0 }) {
    super(defaultState)
  }
}

describe(`useContextModel`, () => {
  it(`should throw error if no model`, () => {
    const { result } = renderHook(() => useContextModel(CountModel))

    expect(result.error?.message).toBe(`There is no instance for ${CountModel}`)
  })

  it(`should return model instance from context`, () => {
    const model = new CountModel()
    const { result } = renderHook(() => useContextModel(CountModel), {
      wrapper: ({ children }) => (
        <ContextModelProvider value={[[CountModel, model]]}>{children}</ContextModelProvider>
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
      <ContextModelProvider value={[[CountModel, modelA]]}>
        <CountApp id="a" />

        <ContextModelProvider value={[[CountModel, modelB]]}>
          <CountApp id="b" />
        </ContextModelProvider>

        <ContextModelProvider value={[[CountModel, modelC]]}>
          <CountApp id="c" />

          <ContextModelProvider value={[[CountModel, modelD]]}>
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
})
