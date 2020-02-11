import * as React from 'react'
import { Link } from 'react-router-dom'

import { paths } from '../../routers'

export function Home() {
  return (
    <div>
      <h1>home</h1>
      <Link to={paths.detail()}>go to detail</Link>
    </div>
  )
}
