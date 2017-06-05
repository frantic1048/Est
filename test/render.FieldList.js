import test from 'ava'

import est from '../'

const render = est.render
const T = est.tokenTypes

test('simple', t => {
  const ast = {
    T: T.Document,
    C: [
      {
        T: T.FieldList,
        C: [
          {
            T: T.Field,
            C: [
              {
                T: T.FieldName,
                C: [{
                  T: T.Text,
                  A: {'value': 'fname'}
                }]
              },
              {
                T: T.FieldBody,
                C: [{
                  T: T.Paragraph,
                  C: [{
                    T: T.Text,
                    A: {'value': 'fff'}
                  }]
                }]
              }
            ]
          }
        ]
      }
    ]}
  const expected = '<table><colgroup><col><col></colgroup><tbody><tr><th>fname</th><td><p>fff</p></td></tr></tbody></table>'
  const actual = render(ast)
  t.is(actual, expected,
    'should render a simple FieldList')
})
