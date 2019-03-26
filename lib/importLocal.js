const importFrom = require('import-from')

module.exports = (dir, name, fallback) => {
  const found = importFrom.silent(dir, name) || importFrom.silent(dir, fallback)
  if (!found) {
    throw new Error(
      `You need to install "${name}"${
        fallback ? ` or "${fallback}"` : ''
      } in current directory!`
    )
  }
  return found
}
