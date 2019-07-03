import { SFCBlock } from '@vue/component-compiler-utils'
import { notSupportedLang } from './utils'
import { ScriptCompilerContext } from './types'

export const compileScript = async (
  script: SFCBlock | null,
  ctx: ScriptCompilerContext
): Promise<SFCBlock | null> => {
  if (!script) return script

  const code = script.content.replace(/^\/\/$/gm, '')

  if (script.lang === 'ts' || script.lang === 'typescript') {
    script.content = await import('./script-compilers/ts').then(
      async ({ compile }) => compile(code, ctx)
    )
  } else if (
    !script.lang ||
    script.lang === 'esnext' ||
    script.lang === 'babel'
  ) {
    script.content = await import('./script-compilers/babel').then(
      async ({ compile }) => compile(code, ctx)
    )
  } else {
    throw new Error(notSupportedLang(script.lang, 'script'))
  }

  return script
}
