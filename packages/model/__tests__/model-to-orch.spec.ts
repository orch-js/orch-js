import { debounceTime, map, withLatestFrom, takeUntil } from 'rxjs/operators'

import { OrchStore } from '@orch/store'
import { Model, effect, reducer, action, registerModel, ModelToOrch, signal } from '@orch/model'

type CountState = {
  count: number
}

class CountModel extends Model<CountState> {
  defaultState = { count: 0 }

  dispose = signal()

  setCount = reducer<CountState, number>((state, count) => {
    state.count = count
  })

  debounceAddCount = effect<number, CountState>((count$, state$, caseId) =>
    count$.pipe(
      withLatestFrom(state$),
      takeUntil(this.dispose.signal$(caseId)),
      debounceTime(1000),
      map(([count, state]) => action(this.setCount, state.count + count)),
    ),
  )
}

jest.useFakeTimers()

describe('@orch/model/register/model-to-orch', () => {
  const store = new OrchStore()
  let count: ModelToOrch<CountModel>

  beforeEach(() => {
    count = registerModel({ store, model: new CountModel() })
  })

  afterEach(() => {
    count.dispose()
  })

  it(`should reducer`, () => {
    count.actions.setCount(2)
    expect(count.getState()).toEqual({ count: 2 })
  })

  it(`should effect`, () => {
    count.actions.debounceAddCount(9)
    jest.runAllTimers()
    expect(count.getState()).toEqual({ count: 9 })
  })
})
