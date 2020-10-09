import { ScriptCompilerContext } from '../types'

// TODO: use `typescript` module to compile typescript code 😅
// So that we have proper type checking at compile time
export const compile = async (
  code: string,
  { filename }: ScriptCompilerContext
): Promise<string> => {
  return import('@babel/core').then(({ transformSync }) => {
    const result = transformSync(code, {
      filename,
      babelrc: false,
      presets: [
        require.resolve('@babel/preset-typescript'),
        require.resolve('../babel/preset')
      ]
    })

    return (result?.code) ?? ''
  })
}
