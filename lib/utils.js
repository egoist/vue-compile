const path = require('path')

exports.humanlizePath = p => path.relative(process.cwd(), p)

exports.notSupportedLang = (lang, tag) => {
  return `"${lang}" is not supported for <${tag}> tag currently, wanna contribute this feature?`
}
