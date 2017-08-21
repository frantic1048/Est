import test from 'ava'

import est from '../lib/est.dev'

const render = est.render
const T = est.tokenTypes

test('simple', t => {
  const ast = {
    T: T.Document,
    C: [{
      T: T.Paragraph,
      C: [{
        T: T.InlineLiterals,
        C: [{
          T: T.Text,
          A: {value: 'I am InlineLiterals'}
        }]
      }]
    }]
  }
  const expected = '<p><code>I am InlineLiterals</code></p>'
  const actual = render(ast)
  t.is(actual, expected,
    'should render a simple InlineLiterals')
})
