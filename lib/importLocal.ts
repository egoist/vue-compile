const importFrom = require('import-from')
interface ImportLocal {
  dir: string,
  name: string,
  fallback?: string
}
export default (locals: ImportLocal) => {
  const { dir, name, fallback } = locals;
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
