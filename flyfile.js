const spawn = require('child_process').spawn
const testSrc = './test/*.js'
const estSrc = './src/**/*.js'
const pegSrc = './src/parser.pegjs'
const buildTarget = './build/node/'

exports.build = function* build (fly) {
  yield fly.source(pegSrc)
    .peg({format: 'commonjs'})
    .target(buildTarget)
  yield fly.source(estSrc).target(buildTarget)
}

exports.buildDebug = function* buildDebug (fly) {
  yield fly.source(pegSrc)
    .peg({trace: true, format: 'commonjs'})
    .target(buildTarget)
  yield fly.source(estSrc).target(buildTarget)
}

exports.lint = function* lint (fly) {
  yield fly.source([estSrc, testSrc]).eslint()
}

exports.test = function* test (fly) {
  // fly-ava not showing logs, use spawn()
  // https://github.com/flyjs/fly-ava/issues/15
  // yield fly.source(testSrc).ava()
  spawn('./node_modules/ava/cli.js',
    ['-v', '--no-power-assert'],
    { stdio: 'inherit' })
}

exports.dev = function* dev (fly) {
  yield fly.serial(['buildDebug', 'test'])
  yield fly.watch([estSrc, pegSrc, testSrc], ['buildDebug', 'test'])
}

exports.ci = function* ci (fly) {
  yield fly.serial(['lint', 'buildDebug', 'test'])
}
