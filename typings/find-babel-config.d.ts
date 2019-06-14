declare module 'find-babel-config' {
  function findBabelConfig(cwd: string): Promise<{file: string}>
  export = findBabelConfig;
}
