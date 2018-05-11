// TODO: use `typescript` module to compile typescript code 😅
// So that we have proper type checking at compile time
module.exports = (code, { filename }) => {
  return require('@babel/core').transform(code, {
    filename,
    babelrc: false,
    presets: [
      require.resolve('@babel/preset-typescript')
    ],
    comments: false
  }).code
}
