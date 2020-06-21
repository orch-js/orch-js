import { Observable } from 'rxjs'
import { endWith, tap } from 'rxjs/operators'

import { performer, disposePerformer } from '../../src/performers/performer'

describe(`performers:performer`, () => {
  it(`should subscribe returned observable`, () => {
    const spy = jest.fn()

    performer(() => {
      return new Observable(() => {
        spy()
      })
    })

    expect(spy.mock.calls).toEqual([[]])
  })

  it(`should emit payload if trigger performer`, () => {
    const spy = jest.fn()

    const _performer = performer<number>((payload$) => payload$.pipe(tap(spy)))

    _performer(44)

    expect(spy.mock.calls).toEqual([[44]])
  })

  it(`should throw error if performer is disposed`, () => {
    const _performer = performer<number>((payload$) => payload$)

    disposePerformer(_performer)

    expect(() => _performer(44)).toThrow()
  })

  it(`should not emit payload if performer is disposed`, () => {
    const spy = jest.fn()

    const _performer = performer<number>((payload$) => payload$.pipe(tap(spy)))

    disposePerformer(_performer)

    expect(() => _performer(44)).toThrow()
    expect(spy.mock.calls).toEqual([])
  })

  it(`should complete payload$ after dispose performer`, () => {
    const spy = jest.fn()

    const _performer = performer<number>((payload$) => payload$.pipe(endWith('end'), tap(spy)))

    disposePerformer(_performer)

    expect(spy.mock.calls).toEqual([['end']])
  })
})
