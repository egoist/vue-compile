import path from 'path'

const humanlizePath = (p: string) => path.relative(process.cwd(), p)

const notSupportedLang = (lang: string, tag: string) => {
  return `"${lang}" is not supported for <${tag}> tag currently, wanna contribute this feature?`
}

const escapeRe = (str: string) => {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
}

const replaceContants = (content: string, constants: string) => {
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
const cssExtensionsRe = /\.(css|s[ac]ss|styl(us)?)$/

export {
  humanlizePath,
  notSupportedLang,
  escapeRe,
  replaceContants,
  cssExtensionsRe
}
