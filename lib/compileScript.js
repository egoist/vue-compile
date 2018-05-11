const { notSupportedLang } = require('./utils')

module.exports = async (script, { filename }) => {
  if (!script) return script

  if (script.lang === 'ts' || script.lang === 'typescript') {
    script.content = await require('./script-compilers/ts')(script.content, { filename })
  } else if (!script.lang || script.lang === 'esnext' || script.lang === 'babel') {
    script.content = await require('./script-compilers/babel')(script.content, { filename })
  } else {
    throw new Error(notSupportedLang(script.lang, 'script'))
  }

  return script
}
