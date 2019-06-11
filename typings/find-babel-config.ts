declare module 'find-babel-config' {
  const find: (dir: string) => Promise<any>;
  export { find }
}
