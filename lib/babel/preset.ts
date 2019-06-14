import { cssExtensionsRe } from '../utils';

export default (_: any, { modern }: { modern: string}) => {
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
    plugins: [_replaceExtensionInImports]
  }
}

function _replaceExtensionInImports({ types: t }: { types: {
    stringLiteral: (value: string) => string;
  }}) {
  return {
    name: 'replace-extension-in-imports',
    visitor: {
      ImportDeclaration(path: any) {
        if (cssExtensionsRe.test(path.node.source.value)) {
          path.node.source.value = path.node.source.value.replace(
            cssExtensionsRe,
            '.css'
          )
        }
      },
      CallExpression(path: any) {
        if (path.node.callee.name === 'require') {
          const arg = path.get('arguments.0')
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
