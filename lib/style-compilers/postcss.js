const path = require('path')
const debug = require('debug')('vue-compile:style')

const cache = new Map()

module.exports = async (code, { filename }) => {
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
      }).catch(err => {
        if (err.message.includes('No PostCSS Config found in')) {
          return {}
        }
        throw err
      }))
  cache.set(cwd, config)

  if (config.file) {
    debug(`Using PostCSS config file at ${config.file}`)
  }

  const options = Object.assign(
    {
      from: filename,
      map: false
    },
      config.options
    )

  return require('postcss')(config.plugins || [])
      .process(code, options)
      .then(res => res.css)
}
