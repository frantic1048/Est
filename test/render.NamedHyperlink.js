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
        T: T.NamedHyperlink,
        A: {ref: 'http://gochiusa.com'},
        C: [{
          T: T.Text,
          A: {value: 'Gochiusa'}
        }]
      }]
    }]
  }
  const expected = '<p><a href="http://gochiusa.com">Gochiusa</a></p>'
  const actual = render(ast)
  t.is(actual, expected,
    'should render a simple NamedHyperlink')
})
