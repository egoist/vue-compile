const path = require('path')
const { EventEmitter } = require('events')
const fs = require('fs-extra')
const JoyCon = require('joycon')
const isBinaryPath = require('is-binary-path')
const debug = require('debug')('vue-compile:cli')
const { replaceContants, cssExtensionsRe } = require('./utils')

class VueCompile extends EventEmitter {
  constructor(options) {
    super()

    if (options.config !== false) {
      const joycon = new JoyCon({
        files: [
          typeof options.config === 'string' ?
            options.config :
            'vue-compile.config.js'
        ],
        stopDir: path.dirname(process.cwd())
      })
      const { data: config, path: configPath } = joycon.loadSync()

      if (configPath) {
        debug(`Using config file: ${configPath}`)
      }

      options = Object.assign({}, options, config)
    }

    this.options = this.normalizeOptions(options)
    this.isInputFile =
      this.options.input && fs.statSync(this.options.input).isFile()
  }

  normalizeOptions(options) {
    return Object.assign({}, options, {
      input: options.input && path.resolve(options.input),
      output: options.output && path.resolve(options.output)
    })
  }

  async normalize() {
    if (!this.options.input) {
      return
    }

    if (this.isInputFile) {
      if (!this.options.output) {
        throw new Error('You must specify the path to output file.')
      }

      await this.normalizeFile(this.options.input, this.options.output)
    } else {
      if (!this.options.output) {
        throw new Error('You must specify the path to output directory.')
      }

      await this.normalizeDir(this.options.input, this.options.output)
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
        template,
        customBlocks: sfcDescriptor.customBlocks
      },
      outFile
    )

    this.emit('normalized', input, outFile)
  }

  async normalizeDir(input, outDir) {
    const include = [].concat(this.options.include || [])
    const files = await require('fast-glob')(
      include.length > 0 ? include : ['**/*'],
      {
        cwd: input,
        ignore: ['**/node_modules/**'].concat(this.options.exclude || [])
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
    } else if (/\.s[ac]ss$/.test(filename)) {
      const basename = path.basename(filename)
      if (basename.startsWith('_')) {
        // Ignore sass partial files
        return
      }

      output = await require('./style-compilers/sass')(source, {
        filename,
        indentedSyntax: /\.sass$/.test(filename)
      })
    } else if (/\.styl(us)?/.test(filename)) {
      output = await require('./style-compilers/stylus')(source, {
        filename
      })
    } else {
      output = source
    }

    outFile = outFile.replace(cssExtensionsRe, '.css')

    await fs.outputFile(
      outFile,
      output,
      'utf8'
    )

    this.emit('normalized', filename, outFile)
  }

  async writeBinary(source, { filename, outFile }) {
    await fs.outputFile(outFile, source, 'utf8')

    this.emit('normalized', filename, outFile)
  }
}

module.exports = opts => new VueCompile(opts)
