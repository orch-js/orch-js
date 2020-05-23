import React, { useEffect } from 'react'
import { useContextModel, withContextModelProvider, useModelState } from '@orch/react'
import { useRouter } from 'next/router'

import { DetailModel } from './model'

function DetailComponent() {
  const model = useContextModel(DetailModel)
  const { needFetchData, detail } = useModelState(model, (state) => ({
    needFetchData: state.detail.status !== 'success',
    ...state,
  }))

  useEffect(() => {
    if (needFetchData) {
      model.fetchData()
    }

    return () => model.cancelFetchData()
  }, [needFetchData, model])

  return (
    <div>
      {detail.status === 'loading' && <h1>Loading...</h1>}

      {detail.status === 'failed' && <button onClick={model.fetchData}>Retry!</button>}

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
  const router = useRouter()
  const detailId = Array.isArray(router.query.detailId)
    ? router.query.detailId[0]
    : router.query.detailId

  const [destroyModel, model] = React.useMemo(() => DetailModel.create(detailId!), [detailId])

  React.useEffect(() => destroyModel, [destroyModel])

  return model
})
