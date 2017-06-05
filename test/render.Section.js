import test from 'ava'

import est from '../'

const render = est.render
const T = est.tokenTypes

test('simple', t => {
  const ast = {
    T: T.Document,
    C: [{
      T: T.Section,
      A: {level: 1},
      C: [{
        T: T.Text,
        A: {value: 'level1'}
      }]
    }]
  }
  const expected = '<h1>level1</h1>'
  const actual = render(ast)
  t.is(actual, expected,
    'should render a simple section header')
})
