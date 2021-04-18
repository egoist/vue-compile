import path from 'path'
import fs from 'fs-extra'
import { createCompiler } from '../src'

const fixture = (...args: string[]): string =>
  path.resolve(__dirname, 'fixture', ...args)
const tmp = (name: string): string => fixture('output', name)

test('script block', async () => {
  const outDir = tmp('script-block')
  const compiler = createCompiler({
    input: fixture('script-block'),
    output: outDir,
  })
  await compiler.normalize()
  const content = await fs.readFile(path.join(outDir, 'foo.vue'), 'utf8')
  expect(content).toMatchInlineSnapshot(`
    "<script>
    import { ref } from 'vue';
    export default {
      setup() {
        var _a$value;

        const a = ref('a');
        return {
          a: (_a$value = a.value) !== null && _a$value !== void 0 ? _a$value : 'a'
        };
      }

    };
    </script>"
  `)
})

test('script setup', async () => {
  const outDir = tmp('script-setup')
  const compiler = createCompiler({
    input: fixture('script-setup'),
    output: outDir,
  })
  await compiler.normalize()
  const content = await fs.readFile(path.join(outDir, 'foo.vue'), 'utf8')
  expect(content).toMatchInlineSnapshot(`
    "<template>  
        <div>{{ props.foo }}</div>
    </template>

    <script>
    export const foo = 'foo';
    </script>

    <script setup>
    import { defineProps } from 'vue';
    const props = defineProps({
      foo: Number
    });
    </script>"
  `)
})

test('custom blocks', async () => {
  const outDir = tmp('custom-blocks')
  const compiler = createCompiler({
    input: fixture('custom-blocks'),
    output: outDir,
  })
  await compiler.normalize()
  const content = await fs.readFile(path.join(outDir, 'foo.vue'), 'utf8')
  expect(content).toMatchInlineSnapshot(`
                                        "<template>  
                                            <div></div>
                                        </template>

                                        <script>
                                        export default {};
                                        </script>

                                        <foo>this is a custom block</foo>"
                    `)
})

test('keep ts block', async () => {
  const outDir = tmp('keep-ts-block')
  const compiler = createCompiler({
    input: fixture('keep-ts-block'),
    output: outDir,
    preserveTsBlock: true,
  })
  await compiler.normalize()
  const content = await fs.readFile(path.join(outDir, 'foo.vue'), 'utf8')
  expect(content).toMatchInlineSnapshot(`
    "<script lang=\\"ts\\">
    export default {
      setup() {
        let a: string = '1';
        return {
          a
        };
      }

    };
    </script>"
  `)
})

test('keep-async-function', async () => {
  const outDir = tmp('keep-async-function')
  const compiler = createCompiler({
    input: fixture('keep-async-function'),
    output: outDir,
    preserveTsBlock: true,
  })
  await compiler.normalize()
  const content = await fs.readFile(path.join(outDir, 'foo.vue'), 'utf8')
  expect(content).toMatchInlineSnapshot(`
        "<script lang=\\"ts\\">
        export default {
          async setup() {
            console.log('a');
          }

        };
        </script>"
    `)
})
