const { cssExtensionsRe } = require('../utils')

module.exports = (_, { modern } = {}) => {
  return {
    presets: [
      [
        require.resolve('babel-preset-minimal'),
        {
          jsx: 'vue',
          mode: modern ? 'modern' : 'loose'
        }
      ]
    ],
    plugins: [
      replaceExtensionInImports
    ]
  }
}

function replaceExtensionInImports() {
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
      }
    }
  }
}
