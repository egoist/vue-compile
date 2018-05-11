const importFrom = require('import-from')

module.exports = (dir, name) => {
  try {
    return importFrom(dir, name)
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      throw new Error(`You need to install "${name}" in current directory!`)
    } else {
      throw err
    }
  }
}
