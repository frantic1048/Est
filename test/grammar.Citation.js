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
  const actual = parse(`.. [CIT] Text of Cittt
    eeee`, {tracer})
  const expected = {
    ast: [
      {
        T: T.Citation,
        A: {'name': 'CIT'},
        C: [{
          T: T.Paragraph,
          C: [{
            T: T.Text,
            A: {'value': 'Text of Cittteeee'}
          }]
        }]
      }
    ]
  }
  t.true(isMatch(actual, expected),
    'should parse a Citation')
})

test('complex', t => {
  const tracer = t.context.tracer
  const actual = parse(`.. [CIT] Text of note
    eeee

    - yaaa`, {tracer})
  const expected = {
    ast: [
      {
        T: T.Citation,
        A: {'name': 'CIT'},
        C: [
          { T: T.Paragraph },
          { T: T.BulletList }
        ]
      }
    ]
  }
  t.true(isMatch(actual, expected),
    'should parse a Footnote')
})
