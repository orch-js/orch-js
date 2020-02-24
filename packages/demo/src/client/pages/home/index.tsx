import * as React from 'react'
import { Link } from 'react-router-dom'
import { useModel } from '@orch/react'

import { paths } from '../../routers'
import { HomeModel, HomeStatus } from './model'

export function Home() {
  const [state, actions] = useModel(HomeModel, {
    selector: (state) => ({ hasData: state.list.length > 0, ...state }),
  })

  React.useEffect(() => {
    if (!state.hasData) {
      actions.fetchData()
    }

    return () => actions.cancelFetchData()
  }, [actions])

  return (
    <div>
      <h1>home</h1>

      {state.status === HomeStatus.loading && <p>Loading...</p>}

      {state.status === HomeStatus.failed && <button onClick={actions.fetchData}>Retry!</button>}

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
