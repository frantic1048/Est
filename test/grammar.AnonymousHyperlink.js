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

test('implicit', t => {
  const tracer = t.context.tracer
  const actual = parse('RFC-7168__', {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [{
        T: T.Paragraph,
        C: [{
          T: T.AnonymousHyperlink,
          C: [
            {
              T: T.Text,
              A: {
                value: 'RFC-7168'
              }
            }
          ]
        }]
      }]
    }
  }
  t.true(isMatch(actual, expected),
        'shoulp parse implicit anonymous hyperlink')
})

test('explicit', t => {
  const tracer = t.context.tracer
  const actual = parse('`RFC 7168`__', {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [{
        T: T.Paragraph,
        C: [{
          T: T.AnonymousHyperlink,
          C: [
            {
              T: T.Text,
              A: {
                value: 'RFC 7168'
              }
            }
          ]
        }]
      }]
    }
  }
  t.true(isMatch(actual, expected),
    'shoulp parse explicit anonymous hyperlink')
})

test('with absolute URI', t => {
  const tracer = t.context.tracer
  const actual = parse('`香風 智乃<http://gochiusa.wikia.com/wiki/Chino_Kaf%C5%AB>`__', {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [{
        T: T.Paragraph,
        C: [{
          T: T.AnonymousHyperlink,
          A: { ref: 'http://gochiusa.wikia.com/wiki/Chino_Kaf%C5%AB' },
          C: [
            {
              T: T.Text,
              A: {
                value: '香風 智乃'
              }
            }
          ]
        }]
      }]}
  }
  t.true(isMatch(actual, expected), 'should parse embbed URI hyperlink')
})

test('with absolute URI end with __', t => {
  const tracer = t.context.tracer
  const actual = parse('`__init__<http:example.py.html#__init__>`__', {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [{
        T: T.Paragraph,
        C: [{
          T: T.AnonymousHyperlink,
          A: { ref: 'http:example.py.html#__init__' },
          C: [
            {
              T: T.Text,
              A: {
                value: '__init__'
              }
            }
          ]
        }]
      }]}
  }
  t.true(isMatch(actual, expected), 'should parse embbed URI hyperlink')
})

test('escape left angle bracket', t => {
  const tracer = t.context.tracer
  const actual = parse('`Eromanga Sensei\\<Eromanga Sensei wiki_>`__', {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [{
        T: T.Paragraph,
        C: [{
          T: T.AnonymousHyperlink,
          C: [
            {
              T: T.Text,
              A: {
                value: 'Eromanga Sensei\\<Eromanga Sensei wiki_>'
              }
            }
          ]
        }]
      }]}
  }
  t.true(isMatch(actual, expected), 'should parse as AnonymousHyperlink')
})

test('escape right angle bracket', t => {
  const tracer = t.context.tracer
  const actual = parse('`Eromanga Sensei<Eromanga Sensei wiki_\\>`__', {tracer})
  const expected = {
    ast: {
      T: T.Document,
      C: [{
        T: T.Paragraph,
        C: [{
          T: T.AnonymousHyperlink,
          C: [
            {
              T: T.Text,
              A: {
                value: 'Eromanga Sensei<Eromanga Sensei wiki_\\>'
              }
            }
          ]
        }]
      }]}
  }
  t.true(isMatch(actual, expected), 'should parse as AnonymousHyperlink')
})
