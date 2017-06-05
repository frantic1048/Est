import test from 'ava'

import est from '../'

const render = est.render
const T = est.tokenTypes

test('simple', t => {
  const ast = {
    T: T.Document,
    C: [
      {
        T: T.OptionList,
        C: [
          {
            T: T.OptionListItem,
            C: [
              {
                T: T.OptionGroup,
                C: [
                  {
                    T: T.Option,
                    C: [{
                      T: T.OptionString,
                      C: [
                        {
                          T: T.Text,
                          A: {'value': '--aya-ya'}
                        }
                      ]
                    }]
                  }
                ]
              },
              {
                T: T.OptionDescription,
                C: [{
                  T: T.Paragraph,
                  C: [{
                    T: T.Text,
                    A: {'value': 'yaya'}
                  }]
                }]
              }
            ]
          },
          {
            T: T.OptionListItem,
            C: [
              {
                T: T.OptionGroup,
                C: [
                  {
                    T: T.Option,
                    C: [{
                      T: T.OptionString,
                      C: [{
                        T: T.Text,
                        A: {'value': '-b'}
                      }]
                    }]
                  },
                  { T: T.OptionDelimiter },
                  {
                    T: T.Option,
                    C: [
                      {
                        T: T.OptionString,
                        C: [{
                          T: T.Text,
                          A: {'value': '-c'}
                        }]
                      },
                      {
                        T: T.OptionArgument,
                        C: [{
                          T: T.Text,
                          A: {'value': 'FILE'}
                        }]
                      }
                    ]
                  }
                ]
              },
              {
                T: T.OptionDescription,
                C: [{
                  T: T.Paragraph,
                  C: [{
                    T: T.Text,
                    A: {'value': 'bc'}
                  }]
                }]
              }
            ]
          }
        ]
      }
    ]}
  const expected = '<table><colgroup><col><col></colgroup><tbody>' +
    '<tr><td><kbd>--aya-ya</kbd></td><td><p>yaya</p></td></tr>' +
    '<tr><td><kbd>-b, -c<var>FILE</var></kbd></td><td><p>bc</p></td></tr>' +
    '</tbody></table>'
  const actual = render(ast)
  t.is(actual, expected,
    'should render a simple BulletList')
})
