import test from 'ava'

// remove this when AVA has partial match assertion
// https://github.com/avajs/ava/issues/845
import isMatch from './fixtures/isMatch'

import est from '../lib/est.dev'
import Tracer from './fixtures/Tracer'

const parse = est.parse
const transform = est.transform
const T = est.tokenTypes

test.beforeEach('', t => {
  t.context = { tracer: new Tracer() }
})

test('simple', t => {
  const src = `gochiusa__

.. __: http://www.gochiusa.com/
`
  const ast = parse(src, {tracer: t.context.tracer}).ast
  const expected = {
    T: T.Document,
    C: [
      {
        T: T.Paragraph,
        C: [{
          T: T.AnonymousHyperlink,
          A: {ref: 'http://www.gochiusa.com/'},
          C: [{
            T: T.Text,
            A: {value: 'gochiusa'}
          }]
        }]
      },
      {
        T: T.Target,
        C: [{
          T: T.Text,
          A: {value: 'http://www.gochiusa.com/'}
        }]
      }
    ]}
  const actual = transform(ast)
  t.true(isMatch(actual, expected),
    'should transform anonymous hyperlink')
})

test('keep order', t => {
  const src = `Chino__ , Jun__

.. __: https://sketchfab.com/models/9120703a4aee4c2cb0313a9ca3e1e1a3
.. __: https://sketchfab.com/models/e263629d3a824aa18f49c28ddf2b2f14
`

  const ast = parse(src, {tracer: t.context.tracer}).ast

  const expected = {
    T: T.Document,
    C: [
      {
        T: T.Paragraph,
        C: [
          {
            T: T.AnonymousHyperlink,
            A: {ref: 'https://sketchfab.com/models/9120703a4aee4c2cb0313a9ca3e1e1a3'},
            C: [{
              T: T.Text,
              A: {value: 'Chino'}
            }]
          },
          {
            T: T.Text,
            A: {value: ' , '}
          },
          {
            T: T.AnonymousHyperlink,
            A: {ref: 'https://sketchfab.com/models/e263629d3a824aa18f49c28ddf2b2f14'},
            C: [{
              T: T.Text,
              A: {value: 'Jun'}
            }]
          }
        ]
      },
      {
        T: T.Target,
        C: [{
          T: T.Text,
          A: {value: 'https://sketchfab.com/models/9120703a4aee4c2cb0313a9ca3e1e1a3'}
        }]
      },
      {
        T: T.Target,
        C: [{
          T: T.Text,
          A: {value: 'https://sketchfab.com/models/e263629d3a824aa18f49c28ddf2b2f14'}
        }]
      }
    ]}

  const actual = transform(ast)
  t.true(isMatch(actual, expected),
    'should keep anonymous hyperlink order')
})
