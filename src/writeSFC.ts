import path from 'path'
import fs from 'fs-extra'
import stringifyAttrs from 'stringify-attributes'
import { SFCDescriptor } from '@vue/component-compiler-utils'
import { cssExtensionsRe } from './utils'

export const writeSFC = async (
  { script, styles, template, customBlocks }: SFCDescriptor,
  outFile: string
): Promise<void> => {
  const parts = []

  if (template) {
    parts.push(
      `<template${stringifyAttrs(template.attrs)}>${template.content
        .replace(/\n$/, '')
        .replace(/^/gm, '  ')}\n</template>`
    )
  }

  if (script) {
    parts.push(`<script>\n${script.content.trim()}\n</script>`)
  }

  if (styles.length > 0) {
    for (const style of styles) {
      const attrs = { ...style.attrs}
      delete attrs.lang

      if (style.src) {
        attrs.src = style.src.replace(cssExtensionsRe, '.css')
        parts.push(`<style${stringifyAttrs(attrs)}></style>`)
      } else {
        parts.push(
          `<style${stringifyAttrs(attrs)}>\n${style.content.trim()}\n</style>`
        )
      }
    }
  }

  if (customBlocks) {
    for (const block of customBlocks) {
      parts.push(
        `<${block.type}${stringifyAttrs(block.attrs)}>${
          block.content ? block.content.trim() : ''
        }</${block.type}>`
      )
    }
  }

  await fs.ensureDir(path.dirname(outFile))
  await fs.writeFile(outFile, parts.join('\n\n'), 'utf8')
}
