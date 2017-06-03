import test from 'ava'

import est from '../'

const render = est.render
const T = est.tokenTypes

test('single line', t => {
  const ast = {
    T: T.Document,
    C: [{
      T: T.Paragraph,
      C: [{
        T: T.Text,
        A: {value: 'I am Paragraph'}
      }]
    }]
  }
  const expected = '<p>I am Paragraph</p>'
  const actual = render(ast)
  t.is(actual, expected,
    'should render a simple paragraph')
})
