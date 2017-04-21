// exports a Tracer used with parser for debugging

const chalk = require('chalk')

function leftpad (str, len, padstr = ' ') {
  const s = str.toString()

  if (len - s.length <= 0) return s

  let pad = ''
  for (let i = len - s.length; i > 0; --i) pad = `${padstr}${pad}`
  return `${pad}${str}`
}

function rightpad (str, len, padstr = ' ') {
  const s = str.toString()

  if (len - s.length <= 0) return s

  let pad = ''
  for (let i = len - s.length; i > 0; --i) pad = `${padstr}${pad}`
  return `${str}${pad}`
}

function Tracer () {
  this.record = []
}

Tracer.prototype.trace = function (evt) {
  this.record.push(evt)
}

Tracer.prototype.log = function () {
  let indent = 0
  for (const evt of this.record) {
    process.stdout.write(chalk.white(rightpad(
      evt.location.start.line + ':' +
      evt.location.start.column + '-' +
      evt.location.end.line + ':' +
      evt.location.end.column, 8)))

    if (evt.type === 'rule.enter') {
      process.stdout.write(chalk.blue(
        `${leftpad('', indent * 2)} ➔ ${evt.rule}\n`
      ))
      indent += 1
    } else if (evt.type === 'rule.match') {
      indent -= 1
      process.stdout.write(chalk.green(
        `${leftpad('', indent * 2)} ✔ ${evt.rule}\n`
      ))
    } else if (evt.type === 'rule.fail') {
      indent -= 1
      process.stdout.write(chalk.red(
        `${leftpad('', indent * 2)} ✗ ${evt.rule}\n`
      ))
    }
  }
}

module.exports = Tracer
