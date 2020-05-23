import React from 'react'
import Link from 'next/link'
import { useModelState, useLocalModel } from '@orch/react'

import { HomeModel, HomeStatus } from './model'

export function Home() {
  const model = useLocalModel(HomeModel)
  const state = useModelState(model, (state) => ({ hasData: state.list.length > 0, ...state }))

  React.useEffect(() => {
    if (!state.hasData) {
      model.fetchData()
    }

    return () => model.cancelFetchData()
  }, [model])

  return (
    <div>
      <h1>home</h1>

      {state.status === HomeStatus.loading && <p>Loading...</p>}

      {state.status === HomeStatus.failed && <button onClick={model.fetchData}>Retry!</button>}

      {state.status === HomeStatus.idle && (
        <ul>
          {state.list.map((data) => (
            <li key={data.id}>
              <Link href={`detail/${data.id}`}>
                <a>👉 {data.title}</a>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
