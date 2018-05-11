const path = require('path')
const { promisify } = require('util')
const importLocal = require('../importLocal')

module.exports = (code, { filename }) => {
  const stylus = importLocal(path.dirname(filename), 'stylus')
  return promisify(stylus.render.bind(stylus))(code, { filename })
}
