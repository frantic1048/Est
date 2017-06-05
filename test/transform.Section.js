import test from 'ava'

// remove this when AVA has partial match assertion
// https://github.com/avajs/ava/issues/845
import isMatch from './fixtures/isMatch'

import est from '../'
import Tracer from './fixtures/Tracer'

const parse = est.parse
const transform = est.transform
const T = est.tokenTypes

test.beforeEach('', t => {
  t.context = { tracer: new Tracer() }
})

test('simple', t => {
  const src = `=======
Level1
=======


Level2
-------
`
  const ast = parse(src, {tracer: t.context.tracer}).ast
  const expected = {
    T: T.Document,
    C: [
      {
        T: T.Section,
        A: {style: '==', level: 1},
        C: [{
          T: T.Text,
          A: {value: 'Level1'}
        }]
      },
      {
        T: T.Section,
        A: {style: '-', level: 2},
        C: [{
          T: T.Text,
          A: {value: 'Level2'}
        }]
      }
    ]}
  const actual = transform(ast)
  t.true(isMatch(actual, expected),
    'should transform section levels')
})
