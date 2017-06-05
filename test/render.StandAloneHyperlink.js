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
        T: T.StandAloneHyperlink,
        A: {ref: 'ftp://ftp.is.co.za/rfc/rfc1808.txt'},
        C: [
          {
            T: T.Text,
            A: {
              value: 'ftp://ftp.is.co.za/rfc/rfc1808.txt'
            }
          }
        ]
      }]
    }]}
  const expected = '<p><a href="ftp://ftp.is.co.za/rfc/rfc1808.txt">ftp://ftp.is.co.za/rfc/rfc1808.txt</a></p>'
  const actual = render(ast)
  t.is(actual, expected,
    'should render a simple NamedHyperlink')
})
