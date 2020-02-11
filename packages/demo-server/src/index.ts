import * as express from 'express'
import * as path from 'path'

const port = 9001
const app = express()

app.use('/resource', express.static(path.join(__dirname, '../resource')))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})
