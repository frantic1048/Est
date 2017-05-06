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
  const actual = parse('|Urara|', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.SubstitutionReference,
        A: { name: 'Urara' }
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse substitution reference')
})

test('as AnonymousHyperlink', t => {
  const tracer = t.context.tracer
  const actual = parse('|Urara|__', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.AnonymousHyperlink,
        C: [{
          T: T.SubstitutionReference,
          A: { name: 'Urara' }
        }]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse substitution reference')
})

test('as NamedHyperlink', t => {
  const tracer = t.context.tracer
  const actual = parse('|Urara|_', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.NamedHyperlink,
        A: {name: 'Urara'},
        C: [{
          T: T.SubstitutionReference,
          A: { name: 'Urara' }
        }]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse substitution reference')
})
