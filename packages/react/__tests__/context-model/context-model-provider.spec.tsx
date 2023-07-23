import React from 'react'
import { create } from 'react-test-renderer'
import { describe, it, expect } from 'vitest'

import { OrchModel } from '@orch/model'

import { ContextModelProvider } from '../../src'
import { ContextModelContext } from '../../src/context-model/context-model-context'

type CountModelState = { count: number }

class CountModel extends OrchModel<CountModelState> {
  constructor(defaultState: CountModelState = { count: 0 }) {
    super(defaultState)
  }
}

type NameModelState = { name: string }

class NameModel extends OrchModel<NameModelState> {
  constructor(defaultState: NameModelState = { name: 'home' }) {
    super(defaultState)
  }
}

const App = ({ id }: { id?: string }) => {
  const context = React.useContext(ContextModelContext)
  return <div data-id={id} data-context={context} />
}

describe(`withContextModelProvider`, () => {
  it(`should provide context for children`, () => {
    const model = new CountModel()

    const renderResult = create(
      <ContextModelProvider value={[[CountModel, model]]}>
        <App />
      </ContextModelProvider>,
    )

    const value = Array.from(renderResult.root.findByType('div').props['data-context'].entries())

    expect(value).toEqual([[CountModel, model]])
  })

  describe(`nested provider`, () => {
    const modelA = new CountModel()
    const modelB = new CountModel()
    const nameModel = new NameModel()

    const renderResult = create(
      <ContextModelProvider
        value={[
          [CountModel, modelA],
          [NameModel, nameModel],
        ]}
      >
        <App id="parent" />

        <ContextModelProvider value={[[CountModel, modelB]]}>
          <App id="child" />
        </ContextModelProvider>
      </ContextModelProvider>,
    )

    const getContextById = (id: string) =>
      renderResult.root.findByProps({ 'data-id': id }).props['data-context']

    const parentContext = getContextById('parent')
    const childContext = getContextById('child')

    it(`should provide a new map for children`, () => {
      expect(parentContext !== childContext).toBe(true)
    })

    it(`should provide same instance as passed`, () => {
      expect(parentContext.get(CountModel)).toBe(modelA)
      expect(parentContext.get(NameModel)).toBe(nameModel)
    })

    it(`should merge with parent's one`, () => {
      expect(childContext.get(CountModel)).toBe(modelB)
      expect(childContext.get(NameModel)).toBe(nameModel)
    })
  })
})
