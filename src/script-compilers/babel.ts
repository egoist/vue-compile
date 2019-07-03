import path from 'path'
import createDebug from 'debug'
import { TransformOptions } from '@babel/core'
import { ScriptCompilerContext } from '../types'

const debug = createDebug('vue-compile:script')

const cache = new Map()

export const compile = async (code: string, { filename, modern, babelrc }: ScriptCompilerContext): Promise<string> => {
  const cwd = path.dirname(filename)
  const file =
    babelrc === false ?
      null :
      cache.get(cwd) ||
        (require('find-babel-config')(cwd).then((res: any) => res.file))

  cache.set(cwd, file)

  const config: TransformOptions = {
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
