const path = require('path')
const { promisify } = require('util')
const debug = require('debug')('sfc:style')
const importLocal = require('./importLocal')

const cache = new Map()

module.exports = (styles, { filename }) => {
  function compileStylus(code) {
    const stylus = importLocal(path.dirname(filename), 'stylus')
    return promisify(stylus.render.bind(stylus))(code, { filename })
  }

  async function compilePostcss(code) {
    const ctx = {
      file: {
        extname: path.extname(filename),
        dirname: path.dirname(filename),
        basename: path.basename(filename)
      },
      options: {}
    }

    const cwd = path.dirname(filename)
    const config =
      cache.get(cwd) ||
      (await require('postcss-load-config')(ctx, cwd, {
        argv: false
      }).catch(err => {
        if (err.message.includes('No PostCSS Config found in')) {
          return {}
        }
        throw err
      }))
    cache.set(cwd, config)

    if (config.file) {
      debug(`Using PostCSS config file at ${config.file}`)
    }

    const options = Object.assign(
      {
        from: filename,
        map: false
      },
      config.options
    )

    return require('postcss')(config.plugins || [])
      .process(code, options)
      .then(res => res.css)
  }

  return Promise.all(
    styles.map(async style => {
      // Do not handle "src" import
      // Until we figure out how to handle it
      if (style.src) return style

      if (style.lang === 'stylus') {
        style.content = await compileStylus(style.content)
      } else if (!style.lang || style.lang === 'postcss') {
        style.content = await compilePostcss(style.content)
      } else {
        throw new Error(
          `"${
            style.lang
          }"" is not supported for <style> tag currently, wanna contribute this feature?`
        )
      }

      return style
    })
  )
}
