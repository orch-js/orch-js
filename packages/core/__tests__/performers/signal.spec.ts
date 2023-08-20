import { map } from 'rxjs/operators'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { activate, OrchModel, signal } from '../../src'
import { ignoreConsole } from './utils'

describe(`performers:signal`, () => {
  let model: OrchModel<NonNullable<unknown>>

  beforeEach(() => {
    model = new OrchModel({})
    activate(model)
  })

  it(`should emit payload if trigger signal performer`, () => {
    const _signal = signal<number>(model)
    const spy = vi.fn()

    _signal.signal$.subscribe(spy)

    _signal(7)

    expect(spy.mock.calls).toEqual([[7]])
  })

  it(`should be able to process payload`, () => {
    const _signal = signal<number, { num: number }>(model, (payload$) =>
      payload$.pipe(map((num) => ({ num }))),
    )

    const spy = vi.fn()

    _signal.signal$.subscribe(spy)

    _signal(7)

    expect(spy.mock.calls).toEqual([[{ num: 7 }]])
  })

  it(`should keep working after error`, () => {
    const restoreConsole = ignoreConsole()
    const _signal = signal<number, { num: number }>(model, (payload$) =>
      payload$.pipe(
        map((num) => {
          if (num < 0) {
            throw new Error('')
          }
          return { num }
        }),
      ),
    )

    const spy = vi.fn()

    _signal.signal$.subscribe(spy)

    _signal(-1)
    _signal(7)

    expect(spy.mock.calls).toEqual([[{ num: 7 }]])
    restoreConsole()
  })
})
