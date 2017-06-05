import test from 'ava'

import est from '../'

const render = est.render
const T = est.tokenTypes

test('single line', t => {
  const ast = {
    T: T.Document,
    C: [{
      T: T.Transition
    }]
  }
  const expected = '<hr>'
  const actual = render(ast)
  t.is(actual, expected,
    'should render a simple transition')
})
