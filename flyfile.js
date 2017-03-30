const testSrc = './test/*.js'
const estSrc = './src/**/*.js'
const pegSrc = './src/parser.pegjs'
const buildTarget = './build/node/'

const allSrc = [testSrc, estSrc]

exports.build = function* build (fly) {
  yield fly.source(pegSrc)
    .peg({format: 'commonjs'})
    .target(buildTarget)
  yield fly.source(estSrc).target(buildTarget)
}

exports.lint = function* lint (fly) {
  yield fly.source(allSrc).eslint()
}

exports.test = function* test (fly) {
  yield fly.source('./test/index.js').ava()
}

exports.dev = function* dev (fly) {
  yield fly.start('ci')
  yield fly.watch(allSrc, ['build', 'test'])
}

exports.ci = function* ci (fly) {
  yield fly.serial(['lint', 'build', 'test'])
}
