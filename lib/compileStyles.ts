import { notSupportedLang } from './utils';
import stylus from './style-compilers/stylus';
import postcss from './style-compilers/postcss';
import sass from './style-compilers/sass';
import { SFCBlock } from '@vue/component-compiler-utils';

export default  (styles: SFCBlock[], { filename } : { filename: string }) => {
  return Promise.all(
    styles.map(async style => {
      // Do not handle "src" import
      // Until we figure out how to handle it
      if (style.src) return style

      if (style.lang === 'stylus') {
        style.content = await stylus(
          style.content,
          { filename }
        )
      } else if (!style.lang || style.lang === 'postcss') {
        style.content = await postcss(
          style.content,
          { filename }
        )
      } else if (style.lang === 'scss' || style.lang === 'sass') {
        style.content = await sass(style.content, {
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
