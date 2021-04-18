import path from 'path'
import fs from 'fs-extra'
import stringifyAttrs from 'stringify-attributes'
import {
  SFCScriptBlock,
  SFCStyleBlock,
  SFCTemplateBlock,
  SFCBlock,
} from '@vue/compiler-sfc'
import { cssExtensionsRe } from './utils'

export const writeSFC = async (
  {
    scripts,
    styles,
    template,
    customBlocks,
    preserveTsBlock,
  }: {
    scripts: SFCScriptBlock[]
    styles: SFCStyleBlock[]
    template: SFCTemplateBlock | null
    customBlocks: SFCBlock[]
    preserveTsBlock?: boolean
  },
  outFile: string,
): Promise<void> => {
  const parts = []

  if (template) {
    parts.push(
      `<template${stringifyAttrs(template.attrs)}>${template.content
        .replace(/\n$/, '')
        .replace(/^/gm, '  ')}\n</template>`,
    )
  }

  scripts.forEach((script) => {
    parts.push(
      `<script${preserveTsBlock && script.lang === 'ts' ? ' lang="ts"' : ''}${
        script.setup ? ' setup' : ''
      }>\n${script.content.trim()}\n</script>`,
    )
  })

  if (styles.length > 0) {
    for (const style of styles) {
      const attrs = { ...style.attrs }
      delete attrs.lang

      if (style.src) {
        attrs.src = style.src.replace(cssExtensionsRe, '.css')
        parts.push(`<style${stringifyAttrs(attrs)}></style>`)
      } else {
        parts.push(
          `<style${stringifyAttrs(attrs)}>\n${style.content.trim()}\n</style>`,
        )
      }
    }
  }

  if (customBlocks) {
    for (const block of customBlocks) {
      parts.push(
        `<${block.type}${stringifyAttrs(block.attrs)}>${
          block.content ? block.content.trim() : ''
        }</${block.type}>`,
      )
    }
  }

  await fs.ensureDir(path.dirname(outFile))
  await fs.writeFile(outFile, parts.join('\n\n'), 'utf8')
}
