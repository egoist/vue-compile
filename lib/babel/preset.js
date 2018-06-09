module.exports = (_, { modern } = {}) => {
  return {
    presets: [
      [require.resolve('babel-preset-minimal'), {
        jsx: 'vue',
        mode: modern ? 'modern' : 'loose'
      }]
    ]
  }
}
