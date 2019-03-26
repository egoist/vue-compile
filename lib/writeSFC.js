const path = require('path')
const fs = require('fs-extra')
const stringifyAttrs = require('stringify-attributes')
const { cssExtensionsRe } = require('./utils')

module.exports = async ({ script, styles, template }, outFile) => {
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
      const attrs = Object.assign({}, style.attrs)
      delete attrs.lang

      if (style.src) {
        attrs.src = attrs.src.replace(cssExtensionsRe, '.css')
        parts.push(`<style${stringifyAttrs(attrs)}></style>`)
      } else {
        parts.push(
          `<style${stringifyAttrs(attrs)}>\n${style.content.trim()}\n</style>`
        )
      }
    }
  }

  await fs.ensureDir(path.dirname(outFile))
  await fs.writeFile(outFile, parts.join('\n\n'), 'utf8')
}
