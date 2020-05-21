import React from 'react'
import Link from 'next/link'
import { useOrchState } from '@orch/react'

import { HomeModel, HomeStatus } from './model'

export function Home() {
  const [destroyModel, model] = React.useMemo(() => HomeModel.create(), [])
  const state = useOrchState(model.state, (state) => ({ hasData: state.list.length > 0, ...state }))

  React.useEffect(() => destroyModel, [destroyModel])

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
