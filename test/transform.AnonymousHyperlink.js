import test from 'ava'

// remove this when AVA has partial match assertion
// https://github.com/avajs/ava/issues/845
import isMatch from './fixtures/isMatch'

import est from '../lib/est.dev'
import Tracer from './fixtures/Tracer'

const parse = est.parse
const transform = est.transform
const T = est.tokenTypes

test.beforeEach('', t => {
  t.context = { tracer: new Tracer() }
})

test('simple', t => {
  const src = `gochiusa__

.. __: http://www.gochiusa.com/
`
  const ast = parse(src, {tracer: t.context.tracer}).ast
  const expected = {
    T: T.Document,
    C: [
      {
        T: T.Paragraph,
        C: [{
          T: T.AnonymousHyperlink,
          A: {ref: 'http://www.gochiusa.com/'},
          C: [{
            T: T.Text,
            A: {value: 'gochiusa'}
          }]
        }]
      },
      {
        T: T.Target,
        C: [{
          T: T.Text,
          A: {value: 'http://www.gochiusa.com/'}
        }]
      }
    ]}
  const actual = transform(ast)
  t.true(isMatch(actual, expected),
    'should transform anonymous hyperlink')
})
