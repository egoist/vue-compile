import path from 'path'
import debug from 'debug'
const cliDebug = debug('vue-compile:cli')
import findBabelConfig from 'find-babel-config'
import { TCtx } from '../types'

interface IConfig {
  filename: string
  presets: any[]
  babelrc?: boolean
}
export default async (code: string, { filename, modern, babelrc }: TCtx) => {
  const cache = new Map()
  const cwd = path.dirname(filename)
  const file = !babelrc
    ? null
    : cache.get(cwd) ||
      (await findBabelConfig(cwd).then((res) => res.file))

  cache.set(cwd, file)

  const config: IConfig = {
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
    cliDebug(`Using Babel config file at ${file}`)
  } else {
    config.babelrc = false
  }

  return require('@babel/core').transform(code, config).code
}
