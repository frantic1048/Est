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

test('two lines', t => {
  const tracer = t.context.tracer
  const actual = parse(`Head
----`, {tracer})
  const expected = {
    ast: [
      {
        T: T.Section,
        A: {'style': '-'},
        C: [{
          T: T.Text,
          A: {'value': 'Head'}
        }]
      }
    ]
  }
  t.true(isMatch(actual, expected),
    'should parse a Section')
})

test('three lines with multiple markups', t => {
  const tracer = t.context.tracer
  const actual = parse(`==========
*Head* ya
==========`, {tracer})
  const expected = {
    ast: [
      {
        T: T.Section,
        A: {'style': '=='},
        C: [
          { T: T.Emphasis },
          { T: T.Text }
        ]
      }
    ]
  }
  t.true(isMatch(actual, expected),
    'should parse a Section')
})
