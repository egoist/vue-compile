import path from 'path'

export const humanlizePath = (p: string): string => path.relative(process.cwd(), p)

export const notSupportedLang = (lang: string, tag: string): string => {
  return `"${lang}" is not supported for <${tag}> tag currently, wanna contribute this feature?`
}

function escapeRe(str: string): string {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
}

export const replaceContants = (content: string, constants?: {[k:string]:any}): string => {
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

export const cssExtensionsRe = /\.(css|s[ac]ss|styl(us)?)$/
