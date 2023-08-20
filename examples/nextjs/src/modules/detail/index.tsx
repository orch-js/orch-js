import React from 'react'

import { useContextModel, useModelState } from '@orch/react'

import { DetailModel } from './model'

export function DetailComponent() {
  const model = useContextModel(DetailModel)
  const detail = useModelState(model, ({ detail }) => detail, [])

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
