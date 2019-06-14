// TODO: use `typescript` module to compile typescript code 😅
// So that we have proper type checking at compile time
import { transform } from '@babel/core';

export default (code: string, { filename }: { filename: string }) => {
  const transformed = transform(code, {
    filename,
    babelrc: false,
    presets: [
      require.resolve('@babel/preset-typescript'),
      require.resolve('../babel/preset')
    ]
  })
  if (transformed) {
    return transformed.code as string;
  }
  return '';
}
