const path = require('path')
const { EventEmitter } = require('events')
const fs = require('fs-extra')
const JoyCon = require('joycon')
const isBinaryPath = require('is-binary-path')
const debug = require('debug')('vue-compile:cli')
const { replaceContants } = require('./utils')

class VueCompile extends EventEmitter {
  constructor(options) {
    super()

    if (options.config !== false) {
      const joycon = new JoyCon({
        files: [typeof options.config === 'string' ? options.config : 'vue-compile.config.js'],
        stopDir: path.dirname(process.cwd())
      })
      const { data: config, path: configPath } = joycon.loadSync()

      if (configPath) {
        debug(`Using config file: ${configPath}`)
      }
      options = Object.assign({}, options, config)
    }

    this.options = this.normalizeOptions(options)
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
    let source = await fs.readFile(input)

    if (isBinaryPath(input)) {
      return this.writeBinary(source, {
        filename: input,
        outFile
      })
    }

    source = replaceContants(source.toString(), this.options.constants)

    const ctx = {
      filename: input,
      outFile,
      modern: this.options.modern,
      babelrc: this.options.babelrc
    }

    if (!input.endsWith('.vue')) {
      return this.writeText(source, ctx)
    }

    const sfcDescriptor = require('@vue/component-compiler-utils').parse({
      compiler: require('vue-template-compiler'),
      source,
      filename: input,
      needMap: false
    })

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
    const files = await require('fast-glob')(
      ['**/*.vue'].concat(this.options.include || []),
      {
        cwd: input
      }
    )
    await Promise.all(
      files.map(file => {
        return this.normalizeFile(
          path.join(input, file),
          path.join(outDir, file)
        )
      })
    )
  }

  async writeText(source, { filename, babelrc, modern, outFile }) {
    let output

    if (filename.endsWith('.js')) {
      output = await require('./script-compilers/babel')(source, {
        filename,
        babelrc,
        modern
      })
    } else if (filename.endsWith('.ts')) {
      output = await require('./script-compilers/ts')(source, {
        filename,
        babelrc,
        modern
      })
      outFile = outFile.replace(/\.ts$/, '.js')
    } else if (filename.endsWith('.css')) {
      output = await require('./style-compilers/postcss')(source, { filename })
    } else {
      output = source
    }

    await fs.outputFile(outFile, output, 'utf8')

    this.emit('normalized', filename, outFile)
  }

  async writeBinary(source, { filename, outFile }) {
    await fs.outputFile(outFile, source, 'utf8')

    this.emit('normalized', filename, outFile)
  }
}

module.exports = opts => new VueCompile(opts)
