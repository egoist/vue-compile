#!/usr/bin/env node
if (parseInt(process.versions.node, 10) < 8) {
  console.error(require('chalk').red(`The "sfc" module requires Node.js 8 or above!`))
  console.error(require('chalk').dim(`Current version: ${process.versions.node}`))
  process.exit(1)
}

const cac = require('cac').default

const cli = cac()

cli.command('normalize', 'Normalize a Vue single-file component', (input, flags) => {
  const options = Object.assign({
    input: input[0]
  }, flags)
  return require('../lib')(options).normalize()
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

cli.option('debug', {
  desc: 'Show debug output'
})

cli.parse()
