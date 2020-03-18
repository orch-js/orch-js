import * as fs from 'fs'
import * as path from 'path'
import * as express from 'express'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter, StaticRouterContext } from 'react-router'

import { OrchStore } from '@orch/store'
import { StoreProvider } from '@orch/react'

import { App } from '../client/app'

const port = 9002
const packageRoot = path.join(__dirname, '../../')
const indexHtmlFile = path.resolve(packageRoot, './dist/webpack/index.html')

const app = express()

app.get('/*', async (req, res) => {
  const context: StaticRouterContext = {}
  const orchStore = new OrchStore({ enableSsrWaitingGroup: true })

  const app = (
    <StoreProvider value={orchStore}>
      <StaticRouter context={context} location={req.url}>
        <App />
      </StaticRouter>
    </StoreProvider>
  )

  renderToString(app)

  await orchStore.ssrWaitingGroup.waitUntil(1000)

  const renderedApp = renderToString(app)

  // eslint-disable-next-line no-console
  console.log('========= \n', JSON.stringify(orchStore, null, 2))

  fs.readFile(indexHtmlFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Something went wrong:', err)
      return res.status(500).send('Oops, better luck next time!')
    }

    return res.send(
      data
        .replace('<div id="app"></div>', `<div id="app">${renderedApp}</div>`)
        .replace(
          `<html lang="en">`,
          `<html lang="en"><script type="text/javascript">window.STORE_DATA = ${JSON.stringify(
            orchStore,
          )}; console.log("B", STORE_DATA)</script>`,
        ),
    )
  })
})

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`The ssr server listening on port ${port}!`)
})
