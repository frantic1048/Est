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

test('single line', t => {
  const tracer = t.context.tracer
  const actual = parse(`- item1

- item2

- item3`, {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [{
        T: T.BulletList,
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
      }]
    }
  }
  t.true(isMatch(actual, expected),
    'should parse a BulletList with items')
})

test('two line paragraph', t => {
  const tracer = t.context.tracer
  const actual = parse(`- para1,line1
  para1,line2

- item2`, {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [{
        T: T.BulletList,
        C: [
          {
            T: T.ListItem,
            C: [
              {T: T.Paragraph}
            ]
          },
          {
            T: T.ListItem
          }
        ]
      }]
    }
  }
  t.true(isMatch(actual, expected),
    'should parse a BulletList with items')
})

test('two paragraph in one item', t => {
  const tracer = t.context.tracer
  const actual = parse(`- para1

  para2line1
  para2line2

- item2`, {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [
        {
          T: T.BulletList,
          C: [
            {
              T: T.ListItem,
              C: [
                {T: T.Paragraph},
                {T: T.Paragraph}
              ]
            },
            {
              T: T.ListItem
            }
          ]
        }
      ]}
  }
  t.true(isMatch(actual, expected),
    'should parse a BulletList with items')
})

test('end with extra NewLine', t => {
  const tracer = t.context.tracer
  const actual = parse(`- para1
`, {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [{
        T: T.BulletList,
        C: [{
          T: T.ListItem,
          C: [{
            T: T.Paragraph
          }]
        }]
      }]}
  }
  t.true(isMatch(actual, expected),
    'should parse a BulletList with items')
})

test('cascading sublist', t => {
  const tracer = t.context.tracer
  const actual = parse(`- 1.1

  - 1.2.1

  - 1.2.2

    - 1.2.2.1

- 2.1`, {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [{
        T: T.BulletList,
        C: [
          {
            T: T.ListItem,
            C: [
              {T: T.Paragraph},
              {
                T: T.BulletList,
                C: [
                  {T: T.ListItem},
                  {
                    T: T.ListItem,
                    C: [{
                      T: T.BulletList,
                      C: [{T: T.ListItem}]
                    }]
                  }
                ]
              }]
          },
          {
            T: T.ListItem
          }]
      }]}
  }
  t.true(isMatch(actual, expected),
    'should parse a BulletList with items')
})

test('optional NewLine between items', t => {
  const tracer = t.context.tracer
  const actual = parse(`- 1.1
- 2.1`, {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [{
        T: T.BulletList,
        C: [
          {
            T: T.ListItem,
            C: [{T: T.Paragraph}]
          },
          {
            T: T.ListItem,
            C: [{T: T.Paragraph}]
          }]
      }]}
  }
  t.true(isMatch(actual, expected),
    'should parse a BulletList with items')
})

test('many extra NewLine between items', t => {
  const tracer = t.context.tracer
  const actual = parse(`- 1.1




- 2.1`, {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [{
        T: T.BulletList,
        C: [
          {
            T: T.ListItem,
            C: [{T: T.Paragraph}]
          },
          {
            T: T.ListItem,
            C: [{T: T.Paragraph}]
          }]
      }]}
  }
  t.true(isMatch(actual, expected),
    'should parse a BulletList with items')
})
