const resolve = require('path').resolve

const WebpackShellPlugin = require('webpack-shell-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    path: resolve(__dirname, 'lib'),
    filename: 'est.dev.js',
    libraryTarget: 'commonjs'
  },
  module: {
    noParse: /node_modules\/pegjs-util\/PEGUtil\.js/,
    rules: [
      {
        test: /\.pegjs$/,
        loader: 'pegjs-loader',
        options: {
          cache: false,
          trace: true
        }
      }
    ]
  },
  plugins: [
    new WebpackShellPlugin({onBuildEnd: ['node_modules/.bin/ava --watch -v --no-power-assert']})
  ],
  devtool: 'inline-source-map',
  watch: true
}
