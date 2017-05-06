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
  const actual = parse('RFC-2324_', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.NamedHyperlink,
        A: { name: 'RFC-2324' },
        C: [
          {
            T: T.Text,
            A: {
              value: 'RFC-2324'
            }
          }
        ]
      }]
    }]
  }
  t.true(isMatch(actual, expected),
    'shoulp parse implicit named hyperlink')
})

test('explicit', t => {
  const tracer = t.context.tracer
  const actual = parse('`RFC 2324`_', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.NamedHyperlink,
        A: { name: 'RFC 2324' },
        C: [
          {
            T: T.Text,
            A: {
              value: 'RFC 2324'
            }
          }
        ]
      }]
    }]
  }
  t.true(isMatch(actual, expected),
    'shoulp parse explicit named hyperlink')
})

test('with named reference', t => {
  const tracer = t.context.tracer
  const actual = parse('`香風 智乃<Kafuu Chino_>`_', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.NamedHyperlink,
        A: { name: 'Kafuu Chino' },
        C: [
          {
            T: T.Text,
            A: {
              value: '香風 智乃'
            }
          }
        ]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse embbed URI hyperlink')
})
