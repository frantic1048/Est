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
        T: T.AnonymousHyperlink,
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
    'should render a simple AnonymousHyperlink')
})
