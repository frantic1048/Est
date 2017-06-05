import test from 'ava'

import est from '../'

const render = est.render
const T = est.tokenTypes

test('simple', t => {
  const ast = {
    T: T.Document,
    C: [{
      T: T.Paragraph,
      C: [{
        T: T.StrongEmphasis,
        C: [{
          T: T.Text,
          A: {value: 'I am StrongEmphasis'}
        }]
      }]
    }]
  }
  const expected = '<p><strong>I am StrongEmphasis</strong></p>'
  const actual = render(ast)
  t.is(actual, expected,
    'should render a simple strong emphasis')
})
