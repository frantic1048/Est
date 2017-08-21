import test from 'ava'

import est from '../lib/est.dev'

const render = est.render
const T = est.tokenTypes

test('single line', t => {
  const ast = {
    T: T.Document,
    C: [{
      T: T.Paragraph,
      C: [{
        T: T.Emphasis,
        C: [{
          T: T.Text,
          A: {value: 'I am Emphasis'}
        }]
      }]
    }]
  }
  const expected = '<p><em>I am Emphasis</em></p>'
  const actual = render(ast)
  t.is(actual, expected,
    'should render a simple emphasis')
})
