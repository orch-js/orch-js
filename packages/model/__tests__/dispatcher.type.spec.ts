import { assert, IsExact } from 'conditional-type-checks'

import { Dispatcher } from '@orch/model/types'

type ParameterLengthShouldBe<D extends Dispatcher<any>, L extends number> = IsExact<
  Parameters<D>['length'],
  L
>
type ParameterTypeShouldBe<D extends Dispatcher<any>, T> = IsExact<Parameters<D>[0], T>

describe(`Dispatcher type`, () => {
  it(`should only have one params for dispatcher`, () => {
    assert<ParameterLengthShouldBe<Dispatcher<string>, 1>>(true)
  })

  it(`should return identical type`, () => {
    assert<ParameterTypeShouldBe<Dispatcher<string>, string>>(true)
    assert<ParameterTypeShouldBe<Dispatcher<number>, number>>(true)
    assert<ParameterTypeShouldBe<Dispatcher<{ customType: number }>, { customType: number }>>(true)
  })

  it(`should return "any" type payload if type is "any"`, () => {
    assert<ParameterLengthShouldBe<Dispatcher<any>, 1>>(true)
    assert<ParameterTypeShouldBe<Dispatcher<any>, any>>(true)
  })

  it(`should return no payload if type is "void"`, () => {
    assert<ParameterLengthShouldBe<Dispatcher<void>, 0>>(true)
  })

  it(`should return no payload if type is "unknown"`, () => {
    assert<ParameterLengthShouldBe<Dispatcher<unknown>, 0>>(true)
  })
})
