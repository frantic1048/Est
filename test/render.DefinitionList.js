import test from 'ava'

import est from '../'

const render = est.render
const T = est.tokenTypes

test('simple', t => {
  const ast = {
    T: T.Document,
    C: [
      {
        T: T.DefinitionList,
        C: [
          {
            T: T.DefinitionListItem,
            C: [
              {
                T: T.DefinitionListTerm,
                C: [{
                  T: T.Text,
                  A: {'value': 'term'}
                }]
              },
              {
                T: T.DefinitionListDefinition,
                C: [{
                  T: T.Paragraph,
                  C: [{
                    T: T.Text,
                    A: {'value': 'def'}
                  }]
                }]
              }
            ]
          }
        ]
      }
    ]}
  const expected = '<dl><dt>term</dt><dd><p>def</p></dd></dl>'
  const actual = render(ast)
  t.is(actual, expected,
    'should render a simple DefinitionList')
})
