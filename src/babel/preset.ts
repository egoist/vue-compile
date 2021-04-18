import { PluginObj, types as Types } from '@babel/core'
import { cssExtensionsRe } from '../utils'

export default (_: any, opts: { transformTypeScript: boolean }) => {
  const presets = []
  if (opts.transformTypeScript) {
    presets.push(require.resolve('@babel/preset-typescript'))
  }
  presets.push([
    require.resolve('@babel/preset-env'),
    {
      modules: false,
      targets: {
        edge: '79',
        // Node 12 is no longer maintained, and let's pretend Node 13 didn't exist
        node: '14',
        esmodules: true,
      },
    },
  ])

  const plugins = [replaceExtensionInImports]
  if (!opts.transformTypeScript) {
    plugins.push(require('@babel/plugin-syntax-typescript'))
  }

  return {
    presets,
    plugins,
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
            '.css',
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
                t.stringLiteral(res.value.replace(cssExtensionsRe, '.css')),
              ]
            }
          }
        }
      },
    },
  }
}
