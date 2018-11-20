const path = require('path')

exports.humanlizePath = p => path.relative(process.cwd(), p)

exports.notSupportedLang = (lang, tag) => {
  return `"${lang}" is not supported for <${tag}> tag currently, wanna contribute this feature?`
}

function escapeRe(str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
}

exports.replaceContants = (content, constants) => {
  if (!constants) return content

  const RE = new RegExp(
    `\\b(${Object.keys(constants)
      .map(escapeRe)
      .join('|')})\\b`,
    'g'
  )
  content = content.replace(RE, (_, p1) => {
    return constants[p1]
  })

  return content
}
