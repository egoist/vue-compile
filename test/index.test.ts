import path from 'path'
import fs from 'fs-extra'
import { createCompiler } from '../src'

const fixture = (...args: string[]): string => path.resolve(__dirname, 'fixture', ...args)
const tmp = (name: string): string => fixture('output', name)

test('custom blocks', async () => {
  const outDir = tmp('custom-blocks')
  const compiler = createCompiler({
    input: fixture('custom-blocks'),
    output: outDir
  })
  await compiler.normalize()
  const content = await fs.readFile(path.join(outDir, 'foo.vue'), 'utf8')
  expect(content).toMatchSnapshot()
})

