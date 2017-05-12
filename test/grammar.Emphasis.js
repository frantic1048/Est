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
  const actual = parse('*em\\\\p`h\\*sis*', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.Emphasis,
        C: [{
          T: T.Text,
          A: { value: 'em\\p`h*sis' }
        }]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should recognize escape')
})

test('spacing', t => {
  const tracer = t.context.tracer
  const actual = parse('ah* *emph\\*sis* *oh', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.Text,
        A: { value: 'ah* ' }
      }, {
        T: T.Emphasis,
        C: [{
          T: T.Text,
          A: { value: 'emph*sis' }
        }]
      }, {
        T: T.Text,
        A: { value: ' *oh' }
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should recognize keep spaces')
})

test('spacing escape both side', t => {
  const tracer = t.context.tracer
  const actual = parse('ah*\\ *emph\\*sis*\\ *oh', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.Text,
        A: { value: 'ah*' }
      }, {
        T: T.Emphasis,
        C: [{
          T: T.Text,
          A: { value: 'emph*sis' }
        }]
      }, {
        T: T.Text,
        A: { value: '*oh' }
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should recognize escaped space')
})

test('spacing escape one side', t => {
  const tracer = t.context.tracer
  const actual = parse('ah*\\ *emph\\*sis* *oh', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.Text,
        A: { value: 'ah*' }
      }, {
        T: T.Emphasis,
        C: [{
          T: T.Text,
          A: { value: 'emph*sis' }
        }]
      }, {
        T: T.Text,
        A: { value: ' *oh' }
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should recognize escaped space')
})
