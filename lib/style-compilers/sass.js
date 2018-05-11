const path = require('path')
const { promisify } = require('util')
const importLocal = require('../importLocal')

const moduleRe = /^~([a-z0-9]|@).+/i

const getUrlOfPartial = url => {
  const parsedUrl = path.parse(url)
  return `${parsedUrl.dir}${path.sep}_${parsedUrl.base}`
}

module.exports = async (code, { filename, indentedSyntax }) => {
  const sass = importLocal(path.dirname(filename), 'node-sass')
  const res = await promisify(sass.render.bind(sass))({
    file: filename,
    data: code,
    indentedSyntax,
    sourceMap: false,
    importer: [
      (url, importer, done) => {
        if (!moduleRe.test(url)) return done({ file: url })

        const moduleUrl = url.slice(1)
        const partialUrl = getUrlOfPartial(moduleUrl)

        const options = {
          basedir: path.dirname(importer),
          extensions: ['.scss', '.sass', '.css']
        }
        const finishImport = id => {
          done({
            // Do not add `.css` extension in order to inline the file
            file: id.endsWith('.css') ? id.replace(/\.css$/, '') : id
          })
        }

        const next = () => {
          // Catch all resolving errors, return the original file and pass responsibility back to other custom importers
          done({ file: url })
        }

        const resolvePromise = promisify(require('resolve'))

        // Give precedence to importing a partial
        resolvePromise(partialUrl, options)
          .then(finishImport)
          .catch(err => {
            if (err.code === 'MODULE_NOT_FOUND' || err.code === 'ENOENT') {
              resolvePromise(moduleUrl, options)
                .then(finishImport)
                .catch(next)
            } else {
              next()
            }
          })
      }
    ]
  })

  return res.css.toString()
}
