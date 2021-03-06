#!/usr/bin/env node
import path from 'path'
import chalk from 'chalk'

if (parseInt(process.versions.node, 10) < 8) {
  console.error(
    chalk.red('The "vue-compile" module requires Node.js 8 or above!'),
  )
  console.error(chalk.dim(`Current version: ${process.versions.node}`))
  process.exit(1)
}

async function main(): Promise<void> {
  const { cac } = await import('cac')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { version } = require('../package.json')

  const cli = cac('vue-compile')

  cli
    .command('[input]', 'Normalize input file or directory', {
      ignoreOptionDefaultValue: true,
    })
    .usage('[input] [options]')
    .action(async (input: string, flags: any) => {
      const options = {
        input,
        ...flags,
      }

      if (!options.input) {
        delete options.input
      }

      if (options.debug === true) {
        process.env.DEBUG = 'vue-compile:*'
      } else if (typeof options.debug === 'string') {
        process.env.DEBUG = `vue-compile:${options.debug}`
      }

      const { createCompiler } = await import('.')

      if (!options.input) {
        cli.outputHelp()
        return
      }

      const compiler = createCompiler(options)

      compiler.on('normalized', async (input: string, output: string) => {
        if (!compiler.options.debug) {
          const { humanlizePath } = await import('./utils')

          console.log(
            `${chalk.magenta(humanlizePath(input))} ${chalk.dim(
              '->',
            )} ${chalk.green(humanlizePath(output))}`,
          )
        }
      })

      await compiler.normalize().catch(handleError)

      if (flags.watch) {
        const { watch } = await import('chokidar')
        watch('.', {
          cwd: compiler.isInputFile
            ? path.resolve(path.dirname(input))
            : path.resolve(input),
          ignoreInitial: true,
          ignorePermissionErrors: true,
          ignored: '**/{node_modules,dist,.git,public}/**',
        }).on('all', (_, file) => {
          console.log(chalk.bold(`Rebuilding because ${file} changed..`))
          compiler.normalize().catch(handleError)
        })
      }
    })
    .option('-o, --output <file|directory>', 'Output path')
    .option(
      '-i, --include <glob>',
      'A glob pattern to include from input directory',
    )
    .option(
      '-e, --exclude <glob>',
      'A glob pattern to exclude from input directory',
    )
    .option('--no-babelrc', 'Disable .babelrc file')
    .option('--preserve-ts-block', `Preserve TypeScript types in script block`)
    .option('-w, --watch', 'Enable watch mode')

  cli.option('--debug', 'Show debug logs')

  cli.version(version)
  cli.help()

  cli.parse()
}

function handleError(error: Error): void {
  console.error(error.stack)
  process.exit(1)
}

main().catch(handleError)
