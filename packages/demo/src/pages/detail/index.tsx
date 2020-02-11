import * as React from 'react'
import { useModelInstance, useModelState } from '@orch/react'
import { useParams } from 'react-router'

import { DetailModel, DetailState, DetailStatus } from './model'
import { DetailData } from './types'

const defaultState: DetailState = { status: DetailStatus.idle, data: null }

export function Detail() {
  const { id } = useParams<Pick<DetailData, 'id'>>()
  const model = useModelInstance(DetailModel, [defaultState])
  const state = useModelState(model)

  React.useEffect(() => {
    model.fetchData(id)
  }, [id])

  return (
    <div>
      {state.status === DetailStatus.loading && <h1>Loading...</h1>}

      {state.status === DetailStatus.failed && (
        <button onClick={model.fetchData.asAction(id)}>Retry!</button>
      )}

      {state.status === DetailStatus.idle && (
        <div>
          <h1>{state.data?.title}</h1>
          <p>{state.data?.details}</p>
        </div>
      )}
    </div>
  )
}
