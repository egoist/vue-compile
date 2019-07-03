import { PluginObj, types as Types } from '@babel/core'
import { cssExtensionsRe } from '../utils'

export default (_: any, opts: any = {}) => {
  const { modern } = opts
  return {
    presets: [
      [
        require.resolve('babel-preset-minimal'),
        {
          jsx: 'vue',
          mode: modern ? 'modern' : undefined
        }
      ]
    ],
    plugins: [replaceExtensionInImports]
  }
}

function replaceExtensionInImports(opts: { types: typeof Types }): PluginObj {
  const { types: t } = opts
  return {
    name: 'replace-extension-in-imports',
    visitor: {
      ImportDeclaration(path) {
        if (cssExtensionsRe.test(path.node.source.value)) {
          path.node.source.value = path.node.source.value.replace(
            cssExtensionsRe,
            '.css'
          )
        }
      },
      CallExpression(path) {
        if ((path.node.callee as Types.Identifier).name === 'require') {
          const arg: any = path.get('arguments.0')
          if (arg) {
            const res = arg.evaluate()
            if (res.confident && cssExtensionsRe.test(res.value)) {
              path.node.arguments = [
                t.stringLiteral(res.value.replace(cssExtensionsRe, '.css'))
              ]
            }
          }
        }
      }
    }
  }
}
