#!/usr/bin/env node
const chalk = require('chalk')

if (parseInt(process.versions.node, 10) < 8) {
  console.error(chalk.red(`The "sfc" module requires Node.js 8 or above!`))
  console.error(chalk.dim(`Current version: ${process.versions.node}`))
  process.exit(1)
}

const cac = require('cac').default

const cli = cac()

cli.command('normalize', 'Normalize a Vue single-file component', (input, flags) => {
  const options = Object.assign({
    input: input[0]
  }, flags)

  const sfc = require('../lib')(options)

  sfc.on('normalized', (input, output) => {
    if (!sfc.options.debug) {
      const { humanlizePath } = require('../lib/utils')

      console.log(
        `${chalk.magenta(humanlizePath(input))} ${chalk.dim('->')} ${chalk.green(
          humanlizePath(output)
        )}`
      )
    }
  })

  return sfc.normalize()
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

cli.option('debug', {
  desc: 'Show debug output'
})

cli.parse()
