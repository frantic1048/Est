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

test('single line', t => {
  const tracer = t.context.tracer
  const actual = parse(`.. |sub| da:: arg`, {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [
        {
          T: T.SubstitutionDefinition,
          A: {'name': 'sub'},
          C: [{
            T: T.Directive,
            A: {'type': 'da'},
            C: [
              {
                T: T.DirectiveArgument,
                C: [{
                  T: T.Text,
                  A: {'value': 'arg'}
                }]
              }
            ]
          }]
        }
      ]}
  }
  t.true(isMatch(actual, expected),
    'should parse a SubstitutionDefinition')
})

test('multiple lines', t => {
  const tracer = t.context.tracer
  const actual = parse(`.. |sub| da:: arg
   :op: t
   :o2: 3
   Cont
   ent`, {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [
        {
          T: T.SubstitutionDefinition,
          A: {'name': 'sub'},
          C: [{
            T: T.Directive,
            A: {'type': 'da'},
            C: [
              {
                T: T.DirectiveArgument,
                C: [{
                  T: T.Text,
                  A: {'value': 'arg'}
                }]
              },
              {
                T: T.DirectiveOption,
                C: [{ T: T.FieldList }]
              },
              {
                T: T.DirectiveContent,
                C: [{
                  T: T.Text,
                  A: {'value': 'Content'}
                }]
              }
            ]
          }]
        }
      ]}
  }
  t.true(isMatch(actual, expected),
    'should parse a SubstitutionDefinition')
})
