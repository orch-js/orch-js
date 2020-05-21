import { useEffect } from 'react'
import { useContextModel, withContextModelProvider } from '@orch/react'
import { useRouter } from 'next/router'

import { DetailModel } from './model'

function DetailComponent() {
  const [{ needFetchData, detail }, actions] = useContextModel(DetailModel, {
    selector: (state) => ({ needFetchData: state.detail.status !== 'success', ...state }),
  })

  useEffect(() => {
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
  const router = useRouter()
  const caseId = Array.isArray(router.query.detailId)
    ? router.query.detailId[0]
    : router.query.detailId

  return { caseId }
})
