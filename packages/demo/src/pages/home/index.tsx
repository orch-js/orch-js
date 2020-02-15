import * as React from 'react'
import { Link } from 'react-router-dom'
import { useModelInstance, useModelState } from '@orch/react'

import { paths } from '../../routers'
import { HomeModel, HomeStatus } from './model'

export function Home() {
  // TODO: - singleton support
  const homeModel = useModelInstance(HomeModel, [])
  // TODO: - derive state support (eg: isLoading)
  const state = useModelState(homeModel)

  React.useEffect(() => {
    homeModel.fetchData()
  }, [])

  return (
    <div>
      <h1>home</h1>

      {state.status === HomeStatus.loading && <p>Loading...</p>}

      {state.status === HomeStatus.failed && <button onClick={homeModel.fetchData}>Retry!</button>}

      {state.status === HomeStatus.idle && (
        <ul>
          {state.list.map((data) => (
            <li key={data.id}>
              <Link to={paths.detail({ id: data.id })}>👉 {data.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
