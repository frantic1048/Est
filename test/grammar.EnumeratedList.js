import test from 'ava'

// remove this when AVA has partial match assertion
// https://github.com/avajs/ava/issues/845
import isMatch from './fixtures/isMatch'

import est from '../lib/est.dev'
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

test('arabic num.', t => {
  const tracer = t.context.tracer
  const actual = parse(`1. item1

2. item2

3. item3`, {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [
        {
          T: T.EnumeratedList,
          A: { style: {
            t: 'arabic_num',
            suffix: '.'
          }},
          C: [
            {
              T: T.ListItem
            },
            {
              T: T.ListItem
            },
            {
              T: T.ListItem
            }
          ]
        }
      ]}
  }
  t.true(isMatch(actual, expected),
    'should parse a EnumeratedList with items')
})

test('lowercase alpha)', t => {
  const tracer = t.context.tracer
  const actual = parse(`a) item1

b) item2

c) item3`, {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [
        {
          T: T.EnumeratedList,
          A: { style: {
            t: 'lowercase_alpha',
            suffix: ')'
          }},
          C: [
            {
              T: T.ListItem
            },
            {
              T: T.ListItem
            },
            {
              T: T.ListItem
            }
          ]
        }
      ]}
  }
  t.true(isMatch(actual, expected),
    'should parse a EnumeratedList with items')
})

test('uppercase roman (num)', t => {
  const tracer = t.context.tracer
  const actual = parse(`(I) item1

(II) item2

(III) item3`, {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [
        {
          T: T.EnumeratedList,
          A: { style: {
            t: 'uppercase_roman_num',
            prefix: '(',
            suffix: ')'
          }},
          C: [
            {
              T: T.ListItem
            },
            {
              T: T.ListItem
            },
            {
              T: T.ListItem
            }
          ]
        }
      ]}
  }
  t.true(isMatch(actual, expected),
    'should parse a EnumeratedList with items')
})

test('cascade', t => {
  const tracer = t.context.tracer
  const actual = parse(`(i) p

    a) ia
    b) ib

(ii) 1. ii1
     2. ii2

(iii) item3`, {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [
        {
          T: T.EnumeratedList,
          A: { style: {
            t: 'lowercase_roman_num',
            prefix: '(',
            suffix: ')'
          }},
          C: [
            {
              T: T.ListItem,
              C: [
                {T: T.Paragraph},
                {
                  T: T.EnumeratedList,
                  C: [
                    {T: T.ListItem},
                    {T: T.ListItem}
                  ]
                }
              ]
            },
            {
              T: T.ListItem,
              C: [{
                T: T.EnumeratedList,
                C: [
                  {T: T.ListItem},
                  {T: T.ListItem}
                ]
              }]
            },
            {
              T: T.ListItem
            }
          ]
        }
      ]}
  }
  t.true(isMatch(actual, expected),
    'should parse a EnumeratedList with items')
})

test('dots', t => {
  const tracer = t.context.tracer
  const actual = parse(`(i) i.1
(ii) ii.2`, {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [
        {
          T: T.EnumeratedList,
          A: { style: {
            t: 'lowercase_roman_num',
            prefix: '(',
            suffix: ')'
          }},
          C: [
            {
              T: T.ListItem,
              C: [{T: T.Paragraph}]
            },
            {
              T: T.ListItem,
              C: [{T: T.Paragraph}]
            }
          ]
        }
      ]}
  }
  t.true(isMatch(actual, expected),
    'should parse a EnumeratedList with items')
})
