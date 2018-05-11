const path = require('path')
const { EventEmitter } = require('events')
const fs = require('fs-extra')

class SFC extends EventEmitter {
  constructor(options) {
    super()
    this.options = this.normalizeOptions(options)

    if (this.options.debug === true) {
      process.env.DEBUG = 'sfc:*'
    } else if (typeof this.options.debug === 'string') {
      process.env.DEBUG = `sfc:${this.options.debug}`
    }
  }

  normalizeOptions(options) {
    return Object.assign({}, options, {
      input: path.resolve(options.input),
      outFile: options.outFile && path.resolve(options.outFile),
      outDir: options.outDir && path.resolve(options.outDir)
    })
  }

  async normalize() {
    const stat = await fs.stat(this.options.input)
    if (stat.isFile()) {
      if (!this.options.outFile) {
        throw new Error('You must specify the path to output file.')
      }
      await this.normalizeFile(this.options.input, this.options.outFile)
    } else if (stat.isDirectory()) {
      if (!this.options.outDir) {
        throw new Error('You must specify the path to output directory.')
      }
      await this.normalizeDir(this.options.input, this.options.outDir)
    }
  }

  async normalizeFile(input, outFile) {
    const source = await fs.readFile(input, 'utf8')
    const sfcDescriptor = require('@vue/component-compiler-utils').parse({
      source,
      filename: this.options.input,
      needMap: false
    })
    const ctx = {
      filename: input
    }
    const script = await require('./compileScript')(sfcDescriptor.script, ctx)
    const template = await require('./compileTemplate')(
      sfcDescriptor.template,
      ctx
    )
    const styles = await require('./compileStyles')(sfcDescriptor.styles, ctx)

    await require('./writeSFC')(
      {
        script,
        styles,
        template
      },
      outFile
    )

    this.emit('normalized', input, outFile)
  }

  async normalizeDir(input, outDir) {
    const files = await require('fast-glob')('**/*.vue', {
      cwd: input
    })
    await Promise.all(
      files.map(file => {
        return this.normalizeFile(
          path.join(input, file),
          path.join(outDir, file)
        )
      })
    )
  }
}

module.exports = opts => new SFC(opts)
