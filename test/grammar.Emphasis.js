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
  const actual = parse('*emphasis*', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.Emphasis,
        C: [{
          T: T.Text,
          A: { value: 'emphasis' }
        }]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse emphasis text')
})

test('escape', t => {
  const tracer = t.context.tracer
  const actual = parse('*emph\\*sis*', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.Emphasis,
        C: [{
          T: T.Text,
          A: { value: 'emph*sis' }
        }]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should recognize escape')
})

test('outer escape', t => {
  const tracer = t.context.tracer
  const actual = parse('\\**emph\\*sis*\\*', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.Text,
        A: { value: '*' }
      }, {
        T: T.Emphasis,
        C: [{
          T: T.Text,
          A: { value: 'emph*sis' }
        }]
      }, {
        T: T.Text,
        A: { value: '*' }
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should recognize outer escape')
})
