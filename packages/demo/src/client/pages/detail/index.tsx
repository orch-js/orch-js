import * as React from 'react'
import { useModel, useFetchEffect } from '@orch/react'
import { useParams } from 'react-router'

import { DetailModel, DetailStatus } from './model'
import { DetailData } from './types'

export function Detail() {
  const { id } = useParams<Pick<DetailData, 'id'>>()

  const [state, actions] = useModel(DetailModel, {
    caseId: id,
    defaultState: (defaultState) => ({ ...defaultState, detailId: id }),
    selector: (state) => ({ hasData: state.data !== null, ...state }),
  })

  useFetchEffect(() => {
    if (!state.hasData) {
      actions.fetchData()
    }

    return () => actions.cancelFetchData()
  }, [actions])

  return (
    <div>
      {state.status === DetailStatus.loading && <h1>Loading...</h1>}

      {state.status === DetailStatus.failed && <button onClick={actions.fetchData}>Retry!</button>}

      {state.status === DetailStatus.idle && (
        <div>
          <h1>{state.data?.title}</h1>
          <p>{state.data?.details}</p>
        </div>
      )}
    </div>
  )
}
