import path from 'path';
import { promisify } from 'util';
import importLocal from '../importLocal';

const moduleRe = /^~([a-z0-9]|@).+/i

const getUrlOfPartial = (url: string) => {
  const parsedUrl = path.parse(url)
  return `${parsedUrl.dir}${path.sep}_${parsedUrl.base}`
}

export default async (code: string, { filename, indentedSyntax }: {filename :string, indentedSyntax: string}) => {
  const localParameter = {
    dir: path.dirname(filename),
    name: 'sass',
    fallback: 'node-sass',
  }
  const sass = importLocal(localParameter)
  const res = await promisify(sass.render.bind(sass))({
    file: filename,
    data: code,
    indentedSyntax,
    sourceMap: false,
    importer: [
      (url: string, importer: string, done: Function) => {
        if (!moduleRe.test(url)) return done({ file: url })

        const moduleUrl = url.slice(1)
        const partialUrl = getUrlOfPartial(moduleUrl)

        const options = {
          basedir: path.dirname(importer),
          extensions: ['.scss', '.sass', '.css']
        }
        const finishImport = (id: string) => {
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
          .catch((err: { code: string }) => {
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
