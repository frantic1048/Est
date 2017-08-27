/* eslint-disable no-dynamic-require */
/* current loader should be CJS module */

const pegjs = require('pegjs-dev')

module.exports = function loader (source) {
  if (this.cacheable) {
    this.cacheable()
  }

  const pegOptions = Object.assign({
    format: 'es',
    output: 'source'
  }, this.query)

  return pegjs.generate(source, pegOptions)
}
