import path from 'path'
import createDebug from 'debug'
import { TransformOptions } from '@babel/core'
import preset from '../babel/preset'
import { ScriptCompilerContext } from '../types'
import { getBabelConfigFile } from '../utils'

const debug = createDebug('vue-compile:script')

export const compile = async (
  code: string,
  { filename, babelrc, transformTypeScript }: ScriptCompilerContext,
): Promise<string> => {
  const cwd = path.dirname(filename)

  const babelConfigFile = getBabelConfigFile(cwd, babelrc)

  const config: TransformOptions = {
    filename,
    presets: [[preset, { transformTypeScript }]],
  }

  if (babelConfigFile) {
    config.babelrc = true
    debug(`Using Babel config file at ${babelConfigFile}`)
  } else {
    config.babelrc = false
  }

  return require('@babel/core').transform(code, config).code
}
