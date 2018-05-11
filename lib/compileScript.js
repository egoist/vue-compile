const path = require('path')
const debug = require('debug')('sfc:script')

const cache = new Map()

module.exports = async (script, { filename }) => {
  if (!script) return script

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

  script.content = require('@babel/core').transform(
    script.content,
    Object.assign(babelOptions, {
      filename,
      comments: false
    })
  ).code

  return script
}
