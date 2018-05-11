const path = require('path')
const debug = require('debug')('sfc:script')

const cache = new Map()

module.exports = async (code, { filename }) => {
  const cwd = path.dirname(filename)
  const { file, config } =
    cache.get(cwd) || (await require('find-babel-config')(cwd))
  cache.set(cwd, { file, config })

  let babelOptions

  if (file) {
    debug(`Using Babel config file at ${file}`)
    babelOptions = config
  } else {
    debug('Using default @babel/preset-env for script transpilation')
    babelOptions = {
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            modules: false
          }
        ]
      ]
    }
  }

  return require('@babel/core').transform(
    code,
    Object.assign(babelOptions, {
      filename,
      comments: false
    })
  ).code
}
