import path from 'path';
import { EventEmitter } from 'events';
import fs from 'fs-extra';
import JoyCon from 'joycon';
import isBinaryPath from 'is-binary-path';
import debug from 'debug';
const cliDebug = debug('vue-compile:cli');
import { replaceContants, cssExtensionsRe } from './utils';
import { TVueCompileOption, TCtx } from './types'
import vueCompilerUtils from '@vue/component-compiler-utils';
import compileTemplate from './compileTemplate'
import postCssCompiler from './style-compilers/postcss';
import sassCompiler from './style-compilers/sass';
import stylusCompiler from './style-compilers/stylus';
import tsCompiler from './script-compilers/ts';
import babelCompiler from './script-compilers/babel';
import compileScript from './compileScript';
import compileStyle from './compileStyles';
import writeSfc from './writeSFC';
import fastGlob from 'fast-glob'
import { SFCBlock } from '@vue/component-compiler-utils';

class VueCompile extends EventEmitter {
  public options: TVueCompileOption;
	public isInputFile: boolean = false;

  constructor(options: TVueCompileOption) {
    super()

    if (options.config) {
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
        cliDebug(`Using config file: ${configPath}`)
      }
      options = Object.assign({}, options, config)
    }

    this.options = this.normalizeOptions(options)
    this.isInputFile =
      Boolean(this.options.input && fs.statSync(this.options.input).isFile())
  }

  normalizeOptions(options: TVueCompileOption) {
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

  async normalizeFile(input: string, outFile: string) {
    let source: string| ArrayBuffer = await fs.readFile(input)

    if (isBinaryPath(input)) {
      return this.writeBinary(source.toString(), {
        filename: input,
        outFile
      })
    }

    source = replaceContants(source.toString(), this.options.constants);

    const ctx = {
      filename: input,
      outFile,
      modern: this.options.modern,
      babelrc: this.options.babelrc
    }

    if (!input.endsWith('.vue')) {
      return this.writeText(source, ctx)
    }

    const sfcDescriptor = vueCompilerUtils.parse({
      compiler: require('vue-template-compiler'),
      source,
      filename: input,
      needMap: false
    })
    let script: SFCBlock | null = null;
    let template: SFCBlock | null = null
    if(sfcDescriptor.script) {
      script = await compileScript(sfcDescriptor.script, ctx)
    }
    if (sfcDescriptor.template) {
      template = await compileTemplate(
        sfcDescriptor.template,
      )
    }

    const styles = await compileStyle(sfcDescriptor.styles, ctx)

    await writeSfc(
      {
        script,
        styles,
        template
      },
      outFile
    )

    this.emit('normalized', input, outFile)
  }

  async normalizeDir(input: string, outDir: string) {
    const include = [].concat(this.options.include || [])
    const files = await fastGlob(
      include.length > 0 ? include : ['**/*'],
      {
        cwd: input,
        ignore: ['**/node_modules/**'].concat(this.options.exclude || [])
      }
    )
    await Promise.all(
      files.map((file: string) => {
        return this.normalizeFile(
          path.join(input, file),
          path.join(outDir, file)
        )
      })
    )
  }

  async writeText(source: string, { filename, babelrc, modern, outFile = '' }: TCtx) {
    let output

    if (filename.endsWith('.js')) {
      output = await babelCompiler(source, {
        filename,
        babelrc,
        modern
      })
    } else if (filename.endsWith('.ts')) {
      output = await tsCompiler(source, {
        filename,
      })
      outFile = outFile && outFile.replace(/\.ts$/, '.js')
    } else if (filename.endsWith('.css')) {
      output = await postCssCompiler(source, { filename })
    } else if (/\.s[ac]ss$/.test(filename)) {
      const basename = path.basename(filename)
      if (basename.startsWith('_')) {
        // Ignore sass partial files
        return
      }
      output = await sassCompiler(source, {
        filename,
        indentedSyntax: /\.sass$/.test(filename)
      })
    } else if (/\.styl(us)?/.test(filename)) {
      output = await stylusCompiler(source, {
        filename
      })
    } else {
      output = source
    }

    outFile = outFile && outFile.replace(cssExtensionsRe, '.css')

    await fs.outputFile(
      outFile,
      output,
      'utf8'
    )

    this.emit('normalized', filename, outFile)
  }

  async writeBinary(source: string, { filename, outFile = '' }: TCtx) {
    await fs.outputFile(outFile, source, 'utf8')

    this.emit('normalized', filename, outFile)
  }
}
export default (opts: TVueCompileOption) => new VueCompile(opts)
