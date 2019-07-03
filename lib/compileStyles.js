const { notSupportedLang } = require('./utils')

module.exports = (styles, { filename }) => {
  return Promise.all(
    styles.map(async style => {
      // Do not handle "src" import
      // Until we figure out how to handle it
      if (style.src) return style

      const { content } = style

      if (style.lang === 'stylus') {
        style.content = await require('./style-compilers/stylus')(
          content,
          { filename }
        )
      } else if (!style.lang || style.lang === 'postcss') {
        style.content = await require('./style-compilers/postcss')(
          content,
          { filename }
        )
      } else if (style.lang === 'scss' || style.lang === 'sass') {
        style.content = await require('./style-compilers/sass')(content, {
          filename,
          indentedSyntax: style.lang === 'sass'
        })
      } else if (style.lang) {
        throw new Error(notSupportedLang(style.lang, 'style'))
      }

      return style
    })
  )
}
