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

test('Paragraph', t => {
  const tracer = t.context.tracer
  const actual = parse(`p1

p21
p22`, {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.Text,
        A: { value: 'p1' }
      }]
    }, {
      T: T.Paragraph,
      C: [{
        T: T.Text,
        A: { value: 'p21' }
      }, {
        T: T.Text,
        A: { value: 'p22' }
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse two paragraph')
})

test('Emphasis', t => {
  const tracer = t.context.tracer
  const actual = parse('*emphasis*', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.Emphasis,
        C: [{
          T: T.Text,
          A: { value: 'emphasis' }
        }]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse emphasis text')
})

test('Emphasis:escape', t => {
  const tracer = t.context.tracer
  const actual = parse('*emph\\*sis*', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.Emphasis,
        C: [{
          T: T.Text,
          A: { value: 'emph*sis' }
        }]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should recognize escape')
})

test('Emphasis:outer escape', t => {
  const tracer = t.context.tracer
  const actual = parse('\\**emph\\*sis*\\*', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.Text,
        A: { value: '*' }
      }, {
        T: T.Emphasis,
        C: [{
          T: T.Text,
          A: { value: 'emph*sis' }
        }]
      }, {
        T: T.Text,
        A: { value: '*' }
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should recognize outer escape')
})

test('StrongEmphasis', t => {
  const tracer = t.context.tracer
  const actual = parse('**strongemphasis**', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.StrongEmphasis,
        C: [{
          T: T.Text,
          A: { value: 'strongemphasis' }
        }]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse strong emphasis')
})

test('InlineLiterals', t => {
  const tracer = t.context.tracer
  const actual = parse('``inline literals``', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.InlineLiterals,
        C: [{
          T: T.Text,
          A: { value: 'inline literals' }
        }]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse InlineLiterals')
})

test('InterpretedText', t => {
  const tracer = t.context.tracer
  const actual = parse('`interpreted text`', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.InterpretedText,
        C: [{
          T: T.Text,
          A: { value: 'interpreted text' }
        }]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse InterpretedText')
})

test('InterpretedText:prefix role', t => {
  const tracer = t.context.tracer
  const actual = parse(':rr:`interpreted text`', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.InterpretedText,
        A: { role: 'rr' },
        C: [{
          T: T.Text,
          A: { value: 'interpreted text' }
        }]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse InterpretedText with prefix role')
})

test('InterpretedText:suffix role', t => {
  const tracer = t.context.tracer
  const actual = parse('`interpreted text`:rr:', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.InterpretedText,
        A: { role: 'rr' },
        C: [{
          T: T.Text,
          A: { value: 'interpreted text' }
        }]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse InterpretedText with suffix role')
})

test('BulletList:normal', t => {
  const tracer = t.context.tracer
  const actual = parse(`- item1

- item2`, {tracer})
  const expected = {
    ast: [
      {
        T: T.BulletList,
        C: [
          {
            T: T.ListItem
          },
          {
            T: T.ListItem
          }
        ]
      }
    ]
  }
  t.true(isMatch(actual, expected),
    'should parse a BulletList with items')
})
