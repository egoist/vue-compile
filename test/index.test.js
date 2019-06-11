const path = require('path')
const fs = require('fs-extra')
const compile = require('../lib')

const fixture = (...args) => path.resolve(__dirname, 'fixture', ...args)
const tmp = name => fixture('output', name)

test('custom blocks', async () => {
  const outDir = tmp('custom-blocks')
  const compiler = compile({
    input: fixture('custom-blocks'),
    output: outDir
  })
  await compiler.normalize()
  const content = await fs.readFile(path.join(outDir, 'foo.vue'), 'utf8')
  expect(content).toMatchSnapshot()
})

