import test from 'ava'

// remove this when AVA has partial match assertion
// https://github.com/avajs/ava/issues/845
import isMatch from 'lodash.ismatch'

import est from '../'
const parse = est.parse
const T = est.tokenTypes

test('Paragraph', t => {
  const actual = parse(`p1

p21
p22`)
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.Plain,
        A: { value: 'p1' }
      }]
    }, {
      T: T.Paragraph,
      C: [{
        T: T.Plain,
        A: { value: 'p21' }
      }, {
        T: T.Plain,
        A: { value: 'p22' }
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse two paragraph')
})

test('bullet list:normal', t => {
  const actual = parse(`- item1
- item2`)
  const expected = {
    ast: [
      {
        T: T.BulletList,
        C: [
          {
            T: T.BulletListItem
          },
          {
            T: T.BulletListItem
          }
        ]
      }
    ]
  }
  t.true(isMatch(actual, expected),
    'should parse a BulletList with items')
})
