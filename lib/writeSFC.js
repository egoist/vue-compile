const path = require('path')
const fs = require('fs-extra')
const stringifyAttrs = require('stringify-attributes')

module.exports = async ({ script, styles, template }, outFile) => {
  const parts = []

  if (template) {
    parts.push(`<template${stringifyAttrs(template.attrs)}>${template.content.replace(/\n$/, '').replace(/^/gm, '  ')}\n</template>`)
  }

  if (script) {
    parts.push(`<script>\n${script.content.trim()}\n</script>`)
  }

  if (styles.length > 0) {
    for (const style of styles) {
      if (style.src) {
        parts.push(`<style${stringifyAttrs(style.attrs)}></style>`)
      } else {
        delete style.attrs.lang
        parts.push(`<style${stringifyAttrs(style.attrs)}>\n${style.content.trim()}\n</style>`)
      }
    }
  }

  await fs.ensureDir(path.dirname(outFile))
  await fs.writeFile(outFile, parts.join('\n\n'), 'utf8')
}
