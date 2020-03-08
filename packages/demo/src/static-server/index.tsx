import * as path from 'path'
import * as express from 'express'
import * as cors from 'cors'

const port = 9001
const app = express()

app.use(cors())

app.use('/resource', express.static(path.join(__dirname, '../../../resource')))

app.use('/build', express.static(path.join(__dirname, '../../webpack')))

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`The static server listening on port ${port}!`)
})
