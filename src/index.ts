import path from 'path'
import { EventEmitter } from 'events'
import fs from 'fs-extra'
import JoyCon from 'joycon'
import isBinaryPath from 'is-binary-path'
import createDebug from 'debug'
import { parse } from '@vue/compiler-sfc'
import glob from 'fast-glob'
import {
  replaceContants,
  cssExtensionsRe,
  jsExtensionsRe,
  isDefined,
} from './utils'
import { compileScript } from './compileScript'
import { compileStyles } from './compileStyles'
import { compileTemplate } from './compileTemplate'
import { writeSFC } from './writeSFC'

const debug = createDebug('vue-compile:cli')

type OptionContants = Record<string, string | boolean | number>;

interface InputOptions {
  config?: boolean | string
  input: string
  output: string
  constants?: OptionContants
  babelrc?: boolean
  include?: string[]
  exclude?: string[]
  debug?: boolean
  preserveTsBlock?: boolean
}

interface NormalizedOptions {
  input: string
  output: string
  constants?: OptionContants
  babelrc?: boolean
  include?: string[]
  exclude?: string[]
  debug?: boolean
  preserveTsBlock?: boolean
}

class VueCompile extends EventEmitter {
  options: NormalizedOptions

  isInputFile?: boolean

  constructor(options: InputOptions) {
    super()

    if (options.config !== false) {
      const joycon = new JoyCon({
        files: [
          typeof options.config === 'string'
            ? options.config
            : 'vue-compile.config.js',
        ],
        stopDir: path.dirname(process.cwd()),
      })
      const { data: config, path: configPath } = joycon.loadSync()

      if (configPath) {
        debug(`Using config file: ${configPath}`)
      }

      options = { ...options, ...config }
    }

    this.options = this.normalizeOptions(options)
    this.isInputFile = fs.statSync(this.options.input).isFile()
  }

  normalizeOptions(options: InputOptions): NormalizedOptions {
    return {
      ...options,
      input: path.resolve(options.input),
      output: path.resolve(options.output),
    }
  }

  async normalize(): Promise<void> {
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

  async normalizeFile(input: string, outFile: string): Promise<void> {
    if (isBinaryPath(input)) {
      const buffer = await fs.readFile(input)
      return this.writeBinary(buffer, {
        filename: input,
        outFile,
      })
    }

    let source = await fs.readFile(input, 'utf8')
    source = replaceContants(source, this.options.constants)

    const ctx = {
      filename: input,
      outFile,
      babelrc: this.options.babelrc,
      transformTypeScript: true,
    }

    if (!input.endsWith('.vue')) {
      return this.writeText(source, ctx)
    }

    ctx.transformTypeScript = !this.options.preserveTsBlock

    const sfc = parse(source, {
      filename: input,
    })

    const script = await compileScript(sfc.descriptor.script, ctx)
    const scriptSetup = await compileScript(sfc.descriptor.scriptSetup, ctx)
    const template = compileTemplate(sfc.descriptor.template)
    const styles = await compileStyles(sfc.descriptor.styles, ctx)

    await writeSFC(
      {
        scripts: [script, scriptSetup].filter(isDefined).sort((a, b) => {
          return a.loc.start > b.loc.start ? -1 : 1
        }),
        styles,
        template,
        customBlocks: sfc.descriptor.customBlocks,
        preserveTsBlock: this.options.preserveTsBlock,
      },
      outFile,
    )

    this.emit('normalized', input, outFile)
  }

  async normalizeDir(input: string, outDir: string): Promise<void> {
    const include = [...(this.options.include ?? [])]
    const exclude = [...(this.options.exclude ?? [])]
    const files = await glob(include.length > 0 ? include : ['**/*'], {
      cwd: input,
      ignore: ['**/node_modules/**'].concat(exclude),
    })
    await Promise.all(
      files.map(async (file: string) => {
        return this.normalizeFile(
          path.join(input, file),
          path.join(outDir, file),
        )
      }),
    )
  }

  async writeText(
    source: string,
    {
      filename,
      outFile,
      babelrc,
      transformTypeScript,
    }: {
      filename: string
      outFile: string
      babelrc?: boolean
      transformTypeScript: boolean
    },
  ): Promise<void> {
    let output

    if (jsExtensionsRe.test(filename)) {
      output = await import('./script-compilers/babel').then(
        async ({ compile }) => {
          return compile(source, {
            filename,
            babelrc,
            transformTypeScript,
          })
        },
      )
    } else if (filename.endsWith('.css')) {
      output = await import('./style-compilers/postcss').then(
        async ({ compile }) => {
          return compile(source, { filename })
        },
      )
    } else if (/\.s[ac]ss$/.test(filename)) {
      const basename = path.basename(filename)
      if (basename.startsWith('_')) {
        // Ignore sass partial files
        return
      }

      output = await import('./style-compilers/sass').then(
        async ({ compile }) => {
          return compile(source, {
            filename,
            indentedSyntax: filename.endsWith('.sass'),
          })
        },
      )
    } else if (/\.styl(us)?/.test(filename)) {
      output = await import('./style-compilers/stylus').then(
        async ({ compile }) => {
          return compile(source, {
            filename,
          })
        },
      )
    } else {
      output = source
    }

    outFile = outFile.replace(cssExtensionsRe, '.css')
    outFile = outFile.replace(jsExtensionsRe, '.js')

    await fs.outputFile(outFile, output, 'utf8')

    this.emit('normalized', filename, outFile)
  }

  async writeBinary(
    source: Buffer,
    { filename, outFile }: { filename: string; outFile: string },
  ): Promise<void> {
    await fs.outputFile(outFile, source, 'utf8')

    this.emit('normalized', filename, outFile)
  }
}

export const createCompiler = (opts: InputOptions): VueCompile =>
  new VueCompile(opts)
