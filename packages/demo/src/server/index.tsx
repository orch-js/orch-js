import * as fs from 'fs'
import * as path from 'path'
import * as express from 'express'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter, StaticRouterContext } from 'react-router'

import { App } from '../client/app'

const port = 9001
const app = express()
const indexHtmlFile = path.resolve(__dirname, '../../webpack/index.html')

app.use('/resource', express.static(path.join(__dirname, '../../../resource')))

app.use('/build', express.static(path.join(__dirname, '../../webpack')))

app.get('/*', (req, res) => {
  const context: StaticRouterContext = {}

  const app = renderToString(
    <StaticRouter context={context} location={req.url}>
      <App />
    </StaticRouter>,
  )

  fs.readFile(indexHtmlFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Something went wrong:', err)
      return res.status(500).send('Oops, better luck next time!')
    }

    return res.send(data.replace('<div id="app"></div>', `<div id="app">${app}</div>`))
  })
})

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Example app listening on port ${port}!`)
})
