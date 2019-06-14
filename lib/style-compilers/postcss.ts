import path from 'path';
import debug from 'debug';
import postcss from 'postcss';
import postCssLoadConfig from 'postcss-load-config';

const cliDebug = debug('vue-compile:cli');
const cache = new Map()

export default async (code: string, { filename } : { filename: string} ) => {
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
    (await postCssLoadConfig(ctx, cwd, {
      argv: false
    }).catch((err: Error) => {
      if (err.message.includes('No PostCSS Config found in')) {
        return {}
      }
      throw err
    }))
  cache.set(cwd, config)

  if (config.file) {
    cliDebug(`Using PostCSS config file at ${config.file}`)
  }

  const options = Object.assign(
    {
      from: filename,
      map: false
    },
    config.options
  )
  const postCssPlugin = postcss(config.plugins || [])

  return postCssPlugin
    .process(code, options)
    .then(res => res.css)
}
