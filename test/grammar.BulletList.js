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

// FIXME
test('single line', t => {
  const tracer = t.context.tracer
  const actual = parse(`- item1

- item2
- item3`, {tracer})
  const expected = {
    ast: [
      {
        T: T.BulletList,
        C: [
          {
            T: T.ListItem
          },
          {
            T: T.ListItem
          },
          {
            T: T.ListItem
          }
        ]
      }
    ]
  }
  t.true(isMatch(actual, expected),
    'should parse a BulletList with items')
})
