import Link from 'next/link'
import React from 'react'

import { useLocalModel, useModelState } from '@orch/react'

import { HomeModel, HomeState, HomeStatus } from './model'

export * from './types'

export { HomeStatus }

export type HomeProps = { defaultStatus: HomeState }

export function Home({ defaultStatus }: HomeProps) {
  const model = useLocalModel(HomeModel, [defaultStatus])
  const [hasData, state] = useModelState(model, (state, { hasData }) => [hasData, state], [])

  React.useEffect(() => {
    if (!hasData) {
      model.fetchData()
    }

    return () => model.cancelFetchData()
  }, [model, hasData])

  return (
    <div>
      <h1>home</h1>

      {state.status === HomeStatus.loading && <p>Loading...</p>}

      {state.status === HomeStatus.failed && <button onClick={model.fetchData}>Retry!</button>}

      {state.status === HomeStatus.idle && (
        <ul>
          {state.list.map((data) => (
            <li key={data.id}>
              <Link href={`detail/${data.id}`}>👉 {data.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
