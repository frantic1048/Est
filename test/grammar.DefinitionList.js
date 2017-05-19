import test from 'ava'

// remove this when AVA has partial match assertion
// https://github.com/avajs/ava/issues/845
import isMatch from './fixtures/isMatch'

import est from '../'
import Tracer from './fixtures/Tracer'

const parse = est.parse
const T = est.tokenTypes

test.beforeEach('', t => {
  t.context = {
    success: false,
    tracer: new Tracer()
  }
})

test.afterEach('', t => { t.context.success = true })

test.afterEach.always('', t => {
  if (t.context.success === false) {
    t.context.tracer.log()
  }
})

test('simple', t => {
  const tracer = t.context.tracer
  const actual = parse(`term
    def`, {tracer})
  const expected = {
    ast: [
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
    ]
  }
  t.true(isMatch(actual, expected),
    'should parse a DefinitionList')
})

test('classifier', t => {
  const tracer = t.context.tracer
  const actual = parse(`term :cls1 :*cls2* sss
    def`, {tracer})
  const expected = {
    ast: [
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
                T: T.DefinitionListClassifier,
                C: [{
                  T: T.Text,
                  A: {'value': 'cls1'}
                }]
              },
              {
                T: T.DefinitionListClassifier,
                C: [
                  {
                    T: T.Emphasis,
                    C: [{
                      T: T.Text,
                      A: {'value': 'cls2'}
                    }]
                  },
                  {
                    T: T.Text,
                    A: {'value': ' sss'}
                  }
                ]
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
    ]
  }
  t.true(isMatch(actual, expected),
    'should parse a DefinitionList')
})

test('complex definition', t => {
  const tracer = t.context.tracer
  const actual = parse(`term
    - item1
    - item2

    paraaa
term2
    def2`, {tracer})
  const expected = {
    ast: [
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
                C: [
                  {
                    T: T.BulletList,
                    C: [
                    {T: T.ListItem},
                    {T: T.ListItem}
                    ]
                  },
                {T: T.Paragraph}
                ]
              }
            ]
          },
          {
            T: T.DefinitionListItem,
            C: [
              {T: T.DefinitionListTerm},
              {T: T.DefinitionListDefinition}
            ]
          }
        ]
      }
    ]
  }
  t.true(isMatch(actual, expected),
    'should parse a DefinitionList')
})
