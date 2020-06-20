import { signal } from '../../src'
import { map } from 'rxjs/operators'

describe(`performers:signal`, () => {
  it(`should emit payload if trigger signal performer`, () => {
    const _signal = signal<number>()
    const spy = jest.fn()

    _signal.signal$.subscribe(spy)

    _signal(7)

    expect(spy.mock.calls).toEqual([[7]])
  })

  it(`should be able to process payload`, () => {
    const _signal = signal<number, { num: number }>((payload$) =>
      payload$.pipe(map((num) => ({ num }))),
    )

    const spy = jest.fn()

    _signal.signal$.subscribe(spy)

    _signal(7)

    expect(spy.mock.calls).toEqual([[{ num: 7 }]])
  })
})
