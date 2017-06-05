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
  const actual = parse(`--aya-ya  yaya
-b, -c FILE  bc`, {tracer})
  const expected = {
    ast: {
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
  }
  t.true(isMatch(actual, expected),
    'should parse a OptionList')
})

test('complex description', t => {
  const tracer = t.context.tracer
  const actual = parse(`--aya-ya  yaya

          - yayap2

            - subl
-b, -c FILE  bc`, {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [
        {
          T: T.OptionList,
          C: [
            {
              T: T.OptionListItem,
              C: [
              {T: T.OptionGroup},
                {
                  T: T.OptionDescription,
                  C: [
                  { T: T.Paragraph },
                    {
                      T: T.BulletList,
                      C: [
                        {
                          T: T.ListItem,
                          C: [
                          { T: T.Paragraph },
                          { T: T.BulletList }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              T: T.OptionListItem,
              C: [
                {
                  T: T.OptionGroup,
                  C: [
                  { T: T.Option },
                  { T: T.Option }
                  ]
                },
                {
                  T: T.OptionDescription,
                  C: [{ T: T.Paragraph }]
                }
              ]
            }
          ]
        }
      ]}
  }
  t.true(isMatch(actual, expected),
    'should parse a OptionList')
})
