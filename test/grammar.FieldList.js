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

test('simple', t => {
  const tracer = t.context.tracer
  const actual = parse(`:fname: fff`, {tracer})
  const expected = {
    ast: [
      {
        T: T.FieldList,
        C: [
          {
            T: T.Field,
            C: [
              {
                T: T.FieldName,
                C: [{
                  T: T.Text,
                  A: {'value': 'fname'}
                }]
              },
              {
                T: T.FieldBody,
                C: [{
                  T: T.Paragraph,
                  C: [{
                    T: T.Text,
                    A: {'value': 'fff'}
                  }]
                }]
              }
            ]
          }
        ]
      }
    ]
  }
  t.true(isMatch(actual, expected),
    'should parse a FieldList')
})

test('complex', t => {
  const tracer = t.context.tracer
  const actual = parse(`:fn1: fff
:fn2: - item1
  - item2
  - item3

  parara
:fn3: fbody3`, {tracer})
  const expected = {
    ast: [
      {
        T: T.FieldList,
        C: [
          {
            T: T.Field,
            C: [
              {
                T: T.FieldName,
                C: [{
                  T: T.Text,
                  A: {'value': 'fn1'}
                }]
              },
              {
                T: T.FieldBody,
                C: [{
                  T: T.Paragraph,
                  C: [{
                    T: T.Text,
                    A: {'value': 'fff'}
                  }]
                }]
              }
            ]
          },
          {
            T: T.Field,
            C: [
              {T: T.FieldName},
              {
                T: T.FieldBody,
                C: [
                  {T: T.BulletList},
                  {T: T.Paragraph}
                ]
              }
            ]
          },
          {
            T: T.Field,
            C: [
              {T: T.FieldName},
              {
                T: T.FieldBody,
                C: [{T: T.Paragraph}]
              }
            ]
          }
        ]
      }
    ]
  }
  t.true(isMatch(actual, expected),
    'should parse a FieldList')
})
