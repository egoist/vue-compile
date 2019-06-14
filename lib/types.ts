type TCtx = {
  filename: string,
  outFile?: string,
  modern?: string,
  babelrc?: string
}

type TVueCompileOption = {
  input: string;
  config: boolean | string;
  flags: string;
  output: string;
  constants: string;
  modern?: string;
  babelrc?: string;
  include?: [];
  exclude?: string;
  debug?: boolean;
}
type TStyle = {
  content: string
  lang?: string
  attrs: {
    lang: string
    src: string
  }
  src: string
}[]

export {
  TCtx,
  TStyle,
  TVueCompileOption
}
