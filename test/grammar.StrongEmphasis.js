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

test('normal', t => {
  const tracer = t.context.tracer
  const actual = parse('**strongemphasis**', {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [{
        T: T.Paragraph,
        C: [{
          T: T.StrongEmphasis,
          C: [{
            T: T.Text,
            A: { value: 'strongemphasis' }
          }]
        }]
      }]}
  }
  t.true(isMatch(actual, expected), 'should parse strong emphasis')
})

test('sequence', t => {
  const tracer = t.context.tracer
  const actual = parse(
    '**strongemphasis** **strongemphasis**',
    {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [{
        T: T.Paragraph,
        C: [{
          T: T.StrongEmphasis,
          C: [{
            T: T.Text,
            A: { value: 'strongemphasis' }
          }]
        }, {
          T: T.StrongEmphasis,
          C: [{
            T: T.Text,
            A: { value: 'strongemphasis' }
          }]
        }
        ]
      }]}}
  t.true(isMatch(actual, expected), 'should parse strong emphasis')
})
