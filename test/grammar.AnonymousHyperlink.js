import test from 'ava'

// remove this when AVA has partial match assertion
// https://github.com/avajs/ava/issues/845
import isMatch from './fixtures/isMatch'

import est from '../'
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

test('implicit', t => {
  const tracer = t.context.tracer
  const actual = parse('RFC-7168__', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.AnonymousHyperlink,
        C: [
          {
            T: T.Text,
            A: {
              value: 'RFC-7168'
            }
          }
        ]
      }]
    }]
  }
  t.true(isMatch(actual, expected),
    'shoulp parse implicit anonymous hyperlink')
})

test('explicit', t => {
  const tracer = t.context.tracer
  const actual = parse('`RFC 7168`__', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.AnonymousHyperlink,
        C: [
          {
            T: T.Text,
            A: {
              value: 'RFC 7168'
            }
          }
        ]
      }]
    }]
  }
  t.true(isMatch(actual, expected),
    'shoulp parse explicit anonymous hyperlink')
})
