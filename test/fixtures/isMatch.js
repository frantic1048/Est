const im = require('lodash.ismatch')
const chalk = require('chalk')

const inspect = require('util').inspect

function isMatch (actual, expected) {
  const res = im(actual, expected)
  if (res === false) {
    console.log(chalk.green('\nexpected:'))
    console.log(inspect(expected, { depth: null }))
    console.log(chalk.red('\nactual:'))
    console.log(inspect(actual, { depth: null }))
    console.log()
  }
  return res
}

module.exports = isMatch
