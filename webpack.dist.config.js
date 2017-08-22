const resolve = require('path').resolve

const libraryName = 'est'

function baseConfig () {
  return {
    entry: './src/index.js',
    module: {
      noParse: /node_modules\/pegjs-util\/PEGUtil\.js/,
      rules: [
        {
          test: /\.pegjs$/,
          loader: 'pegjs-loader',
          options: {
            cache: false,
            trace: false
          }
        }
      ]
    }
  }
}

const nodeConfig = Object.assign(baseConfig(),
  {
    target: 'node',
    output: {
      path: resolve(__dirname, 'lib'),
      filename: `${libraryName}.js`,
      library: libraryName,
      libraryTarget: 'umd'
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
    }
  }
)
nodeConfig.module.rules.push({
  test: /\.js$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        ['env', {
          targets: {
            node: 6
          }
        }],
        'minify'
      ]
    }
  }
})

const clientConfig = Object.assign(baseConfig(),
  {
    target: 'web',
    output: {
      path: resolve(__dirname, 'lib'),
      filename: `${libraryName}.min.js`,
      library: libraryName,
      libraryTarget: 'var'
    }
  }
)
clientConfig.module.rules.push({
  test: /\.js$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        ['env', {
          targets: {
            browsers: ['last 2 version']
          }
        }],
        'minify'
      ]
    }
  }
})

module.exports = [nodeConfig, clientConfig]
