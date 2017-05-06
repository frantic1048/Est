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

test('numbered', t => {
  const tracer = t.context.tracer
  const actual = parse('[3]_', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.FootnoteReference,
        A: { ref: '3' }
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse footnote reference')
})

test('auto numbered', t => {
  const tracer = t.context.tracer
  const actual = parse('[#]_', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.FootnoteReference,
        A: { ref: '#' }
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse footnote reference')
})

test('auto numbered with label', t => {
  const tracer = t.context.tracer
  const actual = parse('[#yaya]_', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.FootnoteReference,
        A: { ref: '#yaya' }
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse footnote reference')
})

test('auto symbol', t => {
  const tracer = t.context.tracer
  const actual = parse('[*]_', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.FootnoteReference,
        A: { ref: '*' }
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse footnote reference')
})
