const path = require('path')
const debug = require('debug')('sfc:script')

const cache = new Map()

module.exports = async (code, { filename }) => {
  const cwd = path.dirname(filename)
  const { file, config } =
    cache.get(cwd) || (await require('find-babel-config')(cwd))
  cache.set(cwd, { file, config })

  let preset
  if (file) {
    preset = file
    debug(`Using Babel config file at ${file}`)
  } else {
    preset = require.resolve('../babel/preset')
    debug('Using default Babel preset for script transpilation')
  }

  return require('@babel/core').transform(
    code,
    {
      presets: [preset],
      filename
    }
  ).code
}
