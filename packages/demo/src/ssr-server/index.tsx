import * as fs from 'fs'
import * as path from 'path'
import * as express from 'express'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter, StaticRouterContext } from 'react-router'

import { OrchStore } from '@orch/store'
import { registerModel } from '@orch/model'
import { StoreProvider } from '@orch/react'

import { App } from '../client/app'
import { HomeModel } from '../client/pages/home/model'

const port = 9002
const app = express()
const indexHtmlFile = path.resolve(__dirname, '../../webpack/index.html')

app.get('/*', async (req, res) => {
  const context: StaticRouterContext = {}
  const orchStore = new OrchStore({ enableSsrWaitingGroup: true })

  const home = registerModel({ store: orchStore, model: new HomeModel() })

  home.actions.fetchData()

  await orchStore.ssrWaitingGroup.waitUntil(1000)

  const app = renderToString(
    <StoreProvider value={orchStore}>
      <StaticRouter context={context} location={req.url}>
        <App />
      </StaticRouter>
    </StoreProvider>,
  )

  console.log('========= \n', JSON.stringify(orchStore, null, 2))

  fs.readFile(indexHtmlFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Something went wrong:', err)
      return res.status(500).send('Oops, better luck next time!')
    }

    return res.send(
      data
        .replace('<div id="app"></div>', `<div id="app">${app}</div>`)
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
