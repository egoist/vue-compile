import path from 'path'
import createDebug from 'debug'

const debug = createDebug('vue-compile:style')

const cache = new Map()

export const compile = async (
  code: string,
  { filename }: { filename: string }
): Promise<string> => {
  const ctx = {
    file: {
      extname: path.extname(filename),
      dirname: path.dirname(filename),
      basename: path.basename(filename)
    },
    options: {}
  }

  const cwd = path.dirname(filename)
  const config =
    cache.get(cwd) ||
    (await require('postcss-load-config')(ctx, cwd, {
      argv: false
    }).catch((error: Error) => {
      if (error.message.includes('No PostCSS Config found in')) {
        return {}
      }

      throw error
    }))
  cache.set(cwd, config)

  if (config.file) {
    debug(`Using PostCSS config file at ${config.file}`)
  }

  const options = {
    from: filename,
    map: false,
    ...config.options
  }

  return import('postcss').then(async postcss => {
    return postcss
      .default(config.plugins || [])
      .process(code, options)
      .then(res => res.css)
  })
}
