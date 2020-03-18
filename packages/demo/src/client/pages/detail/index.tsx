import * as React from 'react'
import { useFetchEffect, useContextModel, withContextModelProvider } from '@orch/react'
import { useParams } from 'react-router'

import { PathParams } from '../../routers'
import { DetailModel, DetailStatus } from './model'

function DetailComponent() {
  const [state, actions] = useContextModel(DetailModel, {
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

export const Detail = withContextModelProvider(DetailComponent, DetailModel, () => {
  const { detailId } = useParams<Record<keyof PathParams['detail'], string>>()

  return { caseId: detailId }
})
