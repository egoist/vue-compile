
# vue-compile

Compile the blocks in Vue single-file components to JS/CSS from Babel/Sass/Stylus.

## Why This Approach

We want to publish `.vue` files instead of transformed `.js` files on npm because the `.vue` file is preferred in some scenarioes, e.g. `vue-server-renderer` can inline critical CSS from `<style>` blocks.

And we use this library to compile the blocks in `.vue` files to use standard languages so that you can use languages like Sass and your users don't have to install `node-sass` and `sass-loader` just for using your components.


## Install

```bash
yarn global add vue-compile
# or
npm i -g vue-compile
```

## Usage

```bash
# normalize a .vue file
vue-compile example.vue -o output.vue
# normalize a directory
# non .vue files will be simply copied to output directory
vue-compile src -o lib
```

__Then you can publish normalized `.vue` files to npm registry without compiling them to `.js` files.__

Supported transforms (via `lang` attribute):

- `<template>` tag:
  - `html` (default)
- `<script>` tag: 
  - `babel` (default): use our default [babel preset](./lib/babel/preset.js) or your own `.babelrc`
  - `ts` `typescript`: use our default [babel preset](./lib/babel/preset.js) + `@babel/preset-typescript`
- `<style>` tag: 
  - `postcss` (default): use your own `postcss.config.js`
  - `stylus` `sass` `scss`
- Custom blocks: They are not touched.

Gotchas:

- We only handle `src` attribute for `<style>` blocks, we simply replace the extension with `.css` and remove the `lang` attribute.

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

<style lang="scss" src="./foo.scss">

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

<style src="./foo.css">

<style scoped>
.foo {
  color: #f00;
}
</style>
```
</details>

### Compile Standalone CSS Files

CSS files like `.css` `.scss` `.sass` `.styl` will be compiled to output directory with `.css` extension, all relevant `import` statements in `.js` `.ts` or `<script>` blocks will be changed to use `.css` extension as well.

You can exclude them using the `--exclude "**/*.{css,scss,sass,styl}"` flag.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## Author

**vue-compile** © [egoist](https://github.com/egoist), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by egoist with help from contributors ([list](https://github.com/egoist/vue-compile/contributors)).

> [github.com/egoist](https://github.com/egoist) · GitHub [@egoist](https://github.com/egoist) · Twitter [@_egoistlily](https://twitter.com/_egoistlily)
