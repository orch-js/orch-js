import * as React from 'react'
import { useFetchEffect, useContextModel, withContextModelProvider } from '@orch/react'
import { useParams } from 'react-router'

import { PathParams } from '../../routers'
import { DetailModel } from './model'

function DetailComponent() {
  const [{ needFetchData, detail }, actions] = useContextModel(DetailModel, {
    selector: (state) => ({ needFetchData: state.detail.status !== 'success', ...state }),
  })

  useFetchEffect(() => {
    if (needFetchData) {
      actions.fetchData()
    }

    return () => actions.cancelFetchData()
  }, [needFetchData, actions])

  return (
    <div>
      {detail.status === 'loading' && <h1>Loading...</h1>}

      {detail.status === 'failed' && <button onClick={actions.fetchData}>Retry!</button>}

      {detail.status === 'success' && (
        <div>
          <h1>{detail.title}</h1>
          <p>{detail.details}</p>
        </div>
      )}
    </div>
  )
}

export const Detail = withContextModelProvider(DetailComponent, DetailModel, () => {
  const { detailId } = useParams<Record<keyof PathParams['detail'], string>>()

  return { caseId: detailId }
})
