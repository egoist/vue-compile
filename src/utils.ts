import path from 'path'
import { loadPartialConfig } from '@babel/core'

export const humanlizePath = (p: string): string =>
  path.relative(process.cwd(), p)

export const notSupportedLang = (lang: string, tag: string): string => {
  return `"${lang}" is not supported for <${tag}> tag currently, wanna contribute this feature?`
}

function escapeRe(str: string): string {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
}

export const replaceContants = (
  content: string,
  constants?: Record<string, any>,
): string => {
  if (!constants) return content

  const RE = new RegExp(
    `\\b(${Object.keys(constants).map(escapeRe).join('|')})\\b`,
    'g',
  )
  content = content.replace(RE, (_, p1) => {
    return constants[p1]
  })

  return content
}

export const cssExtensionsRe = /\.(css|s[ac]ss|styl(us)?)$/

export const jsExtensionsRe = /\.[jt]sx?$/

const babelConfigCache: Map<string, string | undefined> = new Map()

/**
 * Find babel config file in cwd
 * @param cwd
 * @param babelrc Whether to load babel config file
 */
export const getBabelConfigFile = (cwd: string, babelrc?: boolean) => {
  const file: string | undefined =
    babelrc === false
      ? undefined
      : babelConfigCache.get(cwd) ?? loadPartialConfig()?.babelrc

  babelConfigCache.set(cwd, file)

  return file
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value != null
}
