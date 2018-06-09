const { notSupportedLang } = require('./utils')

module.exports = async (script, ctx) => {
  if (!script) return script

  const code = script.content.replace(/^\/\/$/mg, '')

  if (script.lang === 'ts' || script.lang === 'typescript') {
    script.content = await require('./script-compilers/ts')(code, ctx)
  } else if (!script.lang || script.lang === 'esnext' || script.lang === 'babel') {
    script.content = await require('./script-compilers/babel')(code, ctx)
  } else {
    throw new Error(notSupportedLang(script.lang, 'script'))
  }

  return script
}
