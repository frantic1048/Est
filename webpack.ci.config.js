const resolve = require('path').resolve

const WebpackShellPlugin = require('webpack-shell-plugin')

const libraryName = 'est'

module.exports = {
  entry: './src/index.js',
  target: 'node',
  output: {
    path: resolve(__dirname, 'lib'),
    filename: `${libraryName}.dev.js`,
    library: libraryName,
    libraryTarget: 'commonjs2'
  },
  externals: {
    'sanitize-html': {
      commonjs: 'sanitize-html',
      commonjs2: 'sanitize-html'
    },
    'asty': {
      commonjs: 'asty',
      commonjs2: 'asty'
    }
  },
  resolveLoader: {
    modules: [
      resolve(__dirname, 'loaders'),
      'node_modules'
    ]
  },
  module: {
    noParse: /node_modules\/pegjs-util\/PEGUtil\.js/,
    rules: [
      {
        test: /\.pegjs$/,
        loader: 'pegjs-loader',
        options: {
          cache: false,
          trace: true,
          dependencies: {
            T: './tokenTypes.js'
          }
        }
      }
    ]
  },
  plugins: [
    new WebpackShellPlugin({
      onBuildEnd: ['node_modules/.bin/ava -v --no-power-assert']
    })
  ]
}
