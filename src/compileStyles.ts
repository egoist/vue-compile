import { SFCStyleBlock } from '@vue/compiler-sfc'
import { notSupportedLang } from './utils'

export const compileStyles = async (
  styles: SFCStyleBlock[],
  { filename }: { filename: string },
): Promise<SFCStyleBlock[]> => {
  return Promise.all(
    styles.map(async (style) => {
      // Do not handle "src" import
      // Until we figure out how to handle it
      if (style.src) return style

      const { content } = style

      if (style.lang === 'stylus') {
        style.content = await require('./style-compilers/stylus').compile(
          content,
          {
            filename,
          },
        )
      } else if (!style.lang || style.lang === 'postcss') {
        style.content = await require('./style-compilers/postcss').compile(
          content,
          {
            filename,
          },
        )
      } else if (style.lang === 'scss' || style.lang === 'sass') {
        style.content = await require('./style-compilers/sass').compile(
          content,
          {
            filename,
            indentedSyntax: style.lang === 'sass',
          },
        )
      } else if (style.lang) {
        throw new Error(notSupportedLang(style.lang, 'style'))
      }

      return style
    }),
  )
}
