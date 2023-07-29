import { OrchModel } from '@orch/core'
import { useLocalModel, useModelState } from '@orch/react'

class CountModel extends OrchModel<{ count: number }> {
  constructor() {
    super({ count: 0 })
  }

  setCount = this.reducer((state, count: number) => {
    state.count = count
  })

  add1 = () => {
    this.setCount(this.getState().count + 1)
  }

  minus1 = () => {
    this.setCount(this.getState().count - 1)
  }
}

export default function () {
  const model = useLocalModel(CountModel, [])
  const { count } = useModelState(model)
  return (
    <div>
      <h1>{count}</h1>
      <hr />
      <button onClick={model.add1}>Add</button>
      <hr />
      <button onClick={model.minus1}>Minus</button>
    </div>
  )
}
