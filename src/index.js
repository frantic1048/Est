const parser = require('./parser')
const ASTY = require('asty')
const PEGUtil = require('pegjs-util')

module.exports = function main (rst, opts) {
  // deal with opts
  const asty = new ASTY()
  const result = PEGUtil.parse(
    parser,
    rst,
    {
      startRule: 'Document',
      makeAST: function (line, column, offset, args) {
        return asty.create.apply(asty, args).pos(line, column, offset)
      }
    }
  )

  if (result.error !== null) {
    console.log('ERROR: Parsing Failure: \n' +
    PEGUtil.errorMessage(result.error, true).replace(/^/mg, 'ERROR: '))
  }
  return result
}
