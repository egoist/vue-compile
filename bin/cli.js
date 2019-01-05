#!/usr/bin/env node
const chalk = require('chalk')

if (parseInt(process.versions.node, 10) < 8) {
  console.error(chalk.red(`The "vue-compile" module requires Node.js 8 or above!`))
  console.error(chalk.dim(`Current version: ${process.versions.node}`))
  process.exit(1)
}

const cac = require('cac').default

const cli = cac()

cli.command('*', 'Normalize a Vue single-file component', (input, flags) => {
  if (input.length === 0) {
    return cli.showHelp()
  }

  const options = Object.assign({
    input: input[0]
  }, flags)

  if (options.debug === true) {
    process.env.DEBUG = 'vue-compile:*'
  } else if (typeof options.debug === 'string') {
    process.env.DEBUG = `vue-compile:${options.debug}`
  }

  const vueCompile = require('../lib')(options)

  vueCompile.on('normalized', (input, output) => {
    if (!vueCompile.options.debug) {
      const { humanlizePath } = require('../lib/utils')

      console.log(
        `${chalk.magenta(humanlizePath(input))} ${chalk.dim('->')} ${chalk.green(
          humanlizePath(output)
        )}`
      )
    }
  })

  return vueCompile.normalize()
})
.option('out-file', {
  desc: 'Output file',
  alias: 'o',
  type: 'string'
})
.option('out-dir', {
  desc: 'Output directory',
  alias: 'd',
  type: 'string'
})
.option('include', {
  desc: 'A glob pattern to match extra files you wanna normalize, like *.js',
  type: 'string'
})
.option('babelrc', {
  desc: 'Disable .babelrc file',
  type: 'boolean',
  default: true
})
.option('modern', {
  desc: 'Only supports browsers that support <script type="module">',
  type: 'boolean'
})

cli.option('debug', {
  desc: 'Show debug output'
})

cli.parse()
