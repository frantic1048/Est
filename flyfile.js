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
  yield fly.source(testSrc).ava()
}

exports.dev = function* dev (fly) {
  yield fly.start('ci')
  yield fly.watch([estSrc, pegSrc, testSrc], 'ci')
}

exports.ci = function* ci (fly) {
  yield fly.serial(['lint', 'buildDebug', 'test'])
}
