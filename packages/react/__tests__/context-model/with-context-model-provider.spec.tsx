import React from 'react'
import { create } from 'react-test-renderer'
import { describe, expect, it } from 'vitest'

import { OrchModel } from '@orch/core'

import { useContextModel, useLocalModel, withContextModelProvider } from '../../src'

type CountModelState = { count: number }

class CountModel extends OrchModel<CountModelState> {
  constructor(defaultState: CountModelState = { count: 0 }) {
    super(defaultState)
  }
}

const CountComponent = () => {
  const model = useContextModel(CountModel)
  return <div data-model={model} />
}

describe(`withContextModelProvider`, () => {
  it(`should provide context`, () => {
    const model = new CountModel()

    const CountApp = withContextModelProvider(CountComponent, () => [model])

    const renderResult = create(<CountApp />)

    expect(renderResult.root.findByType('div').props['data-model']).toBe(model)
  })

  it(`should be able to use hooks`, () => {
    const CountApp = withContextModelProvider(CountComponent, () => {
      const model = useLocalModel(CountModel, [])
      return [model]
    })

    const renderResult = create(<CountApp />)

    expect(renderResult.root.findByType('div').props['data-model']).toBeInstanceOf(CountModel)
  })
})
