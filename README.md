
# sfc

A set of useful commands for dealing with Vue single-file components.

## Install

```bash
yarn global add sfc
# or
npm i -g sfc
```

## Commands

### normalize

Normalize (pre-compile) each block of your SFC:

```bash
# normalize a .vue file
sfc normalize example.vue -o output.vue
# normalize all .vue files inside a directory
sfc normalize src -d lib

# you can even normalize src/*.js files if needed
src normalize src -d lib --include "*.js"
```

__Then you can publish normalized `.vue` files to npm registry without compiling them to `.js` files.__

Supported transforms:

- `<template>` tag:
  - `html` (default)
- `<script>` tag: 
  - `babel` (default): use our default [babel preset](./lib/babel/preset.js) or your own `.babelrc`
  - `ts` `typescript`: use our default [babel preset](./lib/babel/preset.js) + `@babel/preset-typescript`
- `<style>` tag: 
  - `postcss` (default): use your own `postcss.config.js`
  - `stylus` `sass` `scss`
- Custom blocks: nope.

Gotchas:

- We don't handle tags that use `src` attribute for now, it will be left as is.

<details><summary>Example</summary><br>

In:

```vue
<template>
  <div class="foo">
    {{ count }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    }
  }
}
</script>

<style lang="stylus" scoped>
@import './colors.styl'

.foo 
  color: $color
</style>
```

Out:

```vue
<template>  
  <div class="foo">
    {{ count }}
  </div>
</template>

<script>
export default {
  data: function data() {
    return {
      count: 0
    };
  }
};
</script>

<style scoped>
.foo {
  color: #f00;
}
</style>
```
</details>

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## Author

**sfc** © [egoist](https://github.com/egoist), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by egoist with help from contributors ([list](https://github.com/egoist/sfc/contributors)).

> [github.com/egoist](https://github.com/egoist) · GitHub [@egoist](https://github.com/egoist) · Twitter [@_egoistlily](https://twitter.com/_egoistlily)
