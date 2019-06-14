import { notSupportedLang } from './utils'
import SFCDescriptor from '@vue/component-compiler-utils'
import { TCtx } from './types'
import babelCompiler from './script-compilers/babel'
import tsCompiler from './script-compilers/ts'

export default async (script: SFCDescriptor.SFCBlock, ctx: TCtx) => {
  if (!script) return script

  const code = script.content.replace(/^\/\/$/gm, '')

  if (script.lang === 'ts' || script.lang === 'typescript') {
    script.content = await tsCompiler(code, ctx)
  } else if (
    !script.lang ||
    script.lang === 'esnext' ||
    script.lang === 'babel'
  ) {
    script.content = await babelCompiler(code, ctx)
  } else {
    throw new Error(notSupportedLang(script.lang, 'script'))
  }

  return script
}
