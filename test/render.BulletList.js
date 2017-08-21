import test from 'ava'

import est from '../lib/est.dev'

const render = est.render
const T = est.tokenTypes

test('simple', t => {
  const ast = {
    T: T.Document,
    C: [{
      T: T.BulletList,
      C: [
        {
          T: T.ListItem,
          C: [{
            T: T.Paragraph,
            C: [{
              T: T.Text,
              A: {value: 'item1'}
            }]
          }]
        },
        {
          T: T.ListItem,
          C: [{
            T: T.Paragraph,
            C: [{
              T: T.Text,
              A: {value: 'item2'}
            }]
          }]
        }
      ]
    }]
  }
  const expected = '<ul><li><p>item1</p></li><li><p>item2</p></li></ul>'
  const actual = render(ast)
  t.is(actual, expected,
    'should render a simple BulletList')
})
