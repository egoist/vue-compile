import resolveFrom from 'resolve-from'

export const importLocal = (dir: string, name: string, fallback?: string): any => {
  const found =
    resolveFrom.silent(dir, name) ||
    (fallback && resolveFrom.silent(dir, fallback))

  if (!found) {
    throw new Error(
      `You need to install "${name}"${
        fallback ? ` or "${fallback}"` : ''
      } in current directory!`
    )
  }

  return require(found)
}
