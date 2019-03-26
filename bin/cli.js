#!/usr/bin/env node
const chalk = require('chalk')

if (parseInt(process.versions.node, 10) < 8) {
  console.error(
    chalk.red(`The "vue-compile" module requires Node.js 8 or above!`)
  )
  console.error(chalk.dim(`Current version: ${process.versions.node}`))
  process.exit(1)
}

const cac = require('cac')
const pkg = require('../package.json')

const cli = cac('vue-compile')

cli
  .command('[input]', 'Normalize input file or directory', {
    ignoreOptionDefaultValue: true
  })
  .usage(`[input] [options]`)
  .action((input, flags) => {
    const options = Object.assign(
      {
        input
      },
      flags
    )

    if (!options.input) {
      delete options.input
    }

    if (options.debug === true) {
      process.env.DEBUG = 'vue-compile:*'
    } else if (typeof options.debug === 'string') {
      process.env.DEBUG = `vue-compile:${options.debug}`
    }

    const vueCompile = require('../lib')(options)

    if (!vueCompile.options.input) {
      return cli.outputHelp()
    }

    vueCompile.on('normalized', (input, output) => {
      if (!vueCompile.options.debug) {
        const { humanlizePath } = require('../lib/utils')

        console.log(
          `${chalk.magenta(humanlizePath(input))} ${chalk.dim(
            '->'
          )} ${chalk.green(humanlizePath(output))}`
        )
      }
    })

    return vueCompile.normalize().catch(handleError)
  })
  .option('-o, --output <file|directory>', 'Output path')
  .option(
    '-e, --exclude <glob>',
    'A glob pattern to match files to exclude from input directory'
  )
  .option('--no-babelrc', 'Disable .babelrc file')
  .option(
    '--modern',
    'Only supports browsers that support <script type="module">'
  )

cli.option('--debug', 'Show debug logs')

cli.version(pkg.version)
cli.help()

cli.parse()

function handleError(error) {
  console.error(error.stack)
  process.exit(1)
}
