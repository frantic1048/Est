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

test('normal', t => {
  const tracer = t.context.tracer
  const actual = parse('`interpreted text`', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.InterpretedText,
        C: [{
          T: T.Text,
          A: { value: 'interpreted text' }
        }]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse InterpretedText')
})

test('with plain text', t => {
  const tracer = t.context.tracer
  const actual = parse('this is `interpreted text`', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.Text,
        A: { value: 'this is ' }
      }, {
        T: T.InterpretedText,
        C: [{
          T: T.Text,
          A: { value: 'interpreted text' }
        }]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse InterpretedText')
})

test('prefix role', t => {
  const tracer = t.context.tracer
  const actual = parse(':rr:`interpreted text`', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.InterpretedText,
        A: { role: 'rr' },
        C: [{
          T: T.Text,
          A: { value: 'interpreted text' }
        }]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse InterpretedText with prefix role')
})

test('suffix role', t => {
  const tracer = t.context.tracer
  const actual = parse('`interpreted text`:rr:', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.InterpretedText,
        A: { role: 'rr' },
        C: [{
          T: T.Text,
          A: { value: 'interpreted text' }
        }]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse InterpretedText with suffix role')
})
