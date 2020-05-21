const fs = require('fs')
const path = require('path')
const randomWords = require('random-words')

const resourcePath = path.resolve(__dirname, '../public/resource')

const writeFilePromise = (filePath, data) =>
  new Promise((resolve) => fs.writeFile(filePath, data, resolve))

const getTitle = () => randomWords({ exactly: 1, maxLength: 10, minLength: 4 }).join('')
const getDetails = () => randomWords({ max: 1000, min: 100, maxLength: 10, minLength: 4 }).join(' ')
const stringify = (data) => JSON.stringify(data, null, 4)

async function run() {
  const list = []

  await Promise.all(
    Array.from({ length: 10 }).map((_, id) => {
      const title = getTitle()
      const details = getDetails()

      list.push({ id, title })

      return writeFilePromise(
        path.join(resourcePath, `${id}.json`),
        stringify({ id, title, details }),
      )
    }),
  )

  fs.writeFileSync(path.join(resourcePath, 'list.json'), stringify(list))
}

run()
