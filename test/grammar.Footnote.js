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

test('simple', t => {
  const tracer = t.context.tracer
  const actual = parse(`.. [#note] Text of note
    eeee`, {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [
        {
          T: T.Footnote,
          A: {'ref': '#note'},
          C: [{
            T: T.Paragraph,
            C: [{
              T: T.Text,
              A: {'value': 'Text of noteeeee'}
            }]
          }]
        }
      ]}
  }
  t.true(isMatch(actual, expected),
    'should parse a Footnote')
})

test('complex', t => {
  const tracer = t.context.tracer
  const actual = parse(`.. [#note] Text of note
    eeee

    - yaaa`, {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [
        {
          T: T.Footnote,
          A: {'ref': '#note'},
          C: [
            { T: T.Paragraph },
            { T: T.BulletList }
          ]
        }
      ]}
  }
  t.true(isMatch(actual, expected),
    'should parse a Footnote')
})
