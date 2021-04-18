import path from 'path'
import { promisify } from 'util'
import { SassRenderCallback, Options as SassRenderOptions } from 'node-sass'
import { importLocal } from '../importLocal'

const moduleRe = /^~([a-z0-9]|@).+/i

const getUrlOfPartial = (url: string): string => {
  const parsedUrl = path.parse(url)
  return `${parsedUrl.dir}${path.sep}_${parsedUrl.base}`
}

type SassRender = (
  options: SassRenderOptions,
  callback: SassRenderCallback,
) => void

export const compile = async (
  code: string,
  { filename, indentedSyntax }: { filename: string; indentedSyntax?: boolean },
): Promise<string> => {
  const sass: { render: SassRender } = importLocal(
    path.dirname(filename),
    'sass',
    'node-sass',
  )
  const res = await promisify(sass.render.bind(sass))({
    file: filename,
    data: code,
    indentedSyntax,
    sourceMap: false,
    importer: [
      (url, importer, done) => {
        if (!moduleRe.test(url)) {
          done({ file: url })
          return
        }

        const moduleUrl = url.slice(1)
        const partialUrl = getUrlOfPartial(moduleUrl)

        const options = {
          basedir: path.dirname(importer),
          extensions: ['.scss', '.sass', '.css'],
        }
        const finishImport = (id: string): void => {
          done({
            // Do not add `.css` extension in order to inline the file
            file: id.endsWith('.css') ? id.replace(/\.css$/, '') : id,
          })
        }

        const next = (): void => {
          // Catch all resolving errors, return the original file and pass responsibility back to other custom importers
          done({ file: url })
        }

        const resolvePromise = promisify(require('resolve'))

        // Give precedence to importing a partial
        resolvePromise(partialUrl, options)
          .then(finishImport)
          .catch((error: any) => {
            if (error.code === 'MODULE_NOT_FOUND' || error.code === 'ENOENT') {
              resolvePromise(moduleUrl, options).then(finishImport).catch(next)
            } else {
              next()
            }
          })
      },
    ],
  })

  return res.css.toString()
}
