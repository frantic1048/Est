import pegjs from 'rollup-plugin-pegjs'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import progress from 'rollup-plugin-progress'
import json from 'rollup-plugin-json'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/est.dev.js',
    format: 'cjs'
  },
  plugins: [
    progress({ clearLine:false }),
    json(),
    resolve({
      jsnext: true,
      main: true,
      browser: false
    }),
    commonjs(),
    pegjs({
      cache: false,
      trace: true
    })
  ]
}
