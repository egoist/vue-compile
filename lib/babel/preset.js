module.exports = () => {
  return {
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          modules: false,
          loose: true,
          useBuiltIns: false,
          exclude: [
            'transform-async-to-generator',
            'transform-regenerator',
            'proposal-object-rest-spread'
          ]
        }
      ]
    ],
    plugins: [
      require.resolve('@babel/plugin-syntax-dynamic-import'),
      require.resolve('babel-plugin-transform-vue-jsx'),
      [
        require.resolve('fast-async'),
        {
          spec: true
        }
      ],
      [
        require.resolve('@babel/plugin-proposal-object-rest-spread'),
        {
          loose: true,
          useBuiltIns: true
        }
      ]
    ]
  }
}
