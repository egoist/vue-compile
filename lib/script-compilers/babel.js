const path = require('path')
const debug = require('debug')('sfc:script')

const cache = new Map()

module.exports = async (code, { filename }) => {
  const cwd = path.dirname(filename)
  const { file } =
    cache.get(cwd) || (await require('find-babel-config')(cwd))
  cache.set(cwd, { file })

  const config = {
    filename
  }
  if (file) {
    config.babelrc = true
    debug(`Using Babel config file at ${file}`)
  } else {
    config.presets = [require.resolve('../babel/preset')]
    debug('Using default Babel preset for script transpilation')
  }

  return require('@babel/core').transform(
    code,
    config
  ).code
}
