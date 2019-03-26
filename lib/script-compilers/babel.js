const path = require('path')
const debug = require('debug')('vue-compile:script')

const cache = new Map()

module.exports = async (code, { filename, modern, babelrc }) => {
  const cwd = path.dirname(filename)
  const file =
    babelrc === false ?
      null :
      cache.get(cwd) ||
        (await require('find-babel-config')(cwd).then(res => res.file))

  cache.set(cwd, file)

  const config = {
    filename,
    presets: [
      [
        require.resolve('../babel/preset'),
        {
          modern
        }
      ]
    ]
  }
  if (file) {
    config.babelrc = true
    debug(`Using Babel config file at ${file}`)
  } else {
    config.babelrc = false
  }

  return require('@babel/core').transform(code, config).code
}
