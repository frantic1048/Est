import test from 'ava'

// remove this when AVA has partial match assertion
// https://github.com/avajs/ava/issues/845
import isMatch from './fixtures/isMatch'

import est from '../lib/est.dev'
import Tracer from './fixtures/Tracer'

const parse = est.parse
const T = est.tokenTypes

test.beforeEach('', t => {
  t.context = {
    success: false,
    tracer: new Tracer()
  }
})

test.afterEach('', t => { t.context.success = true })

test.afterEach.always('', t => {
  if (t.context.success === false) {
    t.context.tracer.log()
  }
})

function macro (t, input, _expected) {
  const tracer = t.context.tracer
  const actual = parse(input, {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [{
        T: T.Transition
      }]}
  }
  t.true(isMatch(actual, expected), 'should parse Transition')
}

test('!!!!', macro, '!!!!')
test('""""', macro, '""""')
test('####', macro, '####')
test('$$$$', macro, '$$$$')
test('%%%%', macro, '%%%%')
test('&&&&', macro, '&&&&')
test("''''", macro, "''''")
test('((((', macro, '((((')
test('))))', macro, '))))')
test('****', macro, '****')
test('++++', macro, '++++')
test(',,,,', macro, ',,,,')
test('----', macro, '----')
test('....', macro, '....')
test('////', macro, '////')
test('::::', macro, '::::')
test(';;;;', macro, ';;;;')
test('<<<<', macro, '<<<<')
test('====', macro, '====')
test('>>>>', macro, '>>>>')
test('????', macro, '????')
test('@@@@', macro, '@@@@')
test('[[[[', macro, '[[[[')
test('\\\\\\\\', macro, '\\\\\\\\')
test(']]]]', macro, ']]]]')
test('^^^^', macro, '^^^^')
test('____', macro, '____')
test('````', macro, '````')
test('{{{{', macro, '{{{{')
test('||||', macro, '||||')
test('}}}}', macro, '}}}}')
test('~~~~', macro, '~~~~')
