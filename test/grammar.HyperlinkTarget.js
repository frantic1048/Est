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

test('internal', t => {
  const tracer = t.context.tracer
  const actual = parse('.. _naaa:', {tracer})
  const expected = {
    ast: [
      {
        T: T.Target,
        A: {'name': 'naaa'},
        C: []
      }
    ]
  }
  t.true(isMatch(actual, expected),
    'should parse a Target')
})

test('internal: complex name', t => {
  const tracer = t.context.tracer
  const actual = parse('.. _`naaa  a`:', {tracer})
  const expected = {
    ast: [
      {
        T: T.Target,
        A: {'name': 'naaa  a'},
        C: []
      }
    ]
  }
  t.true(isMatch(actual, expected),
    'should parse a Target')
})

test('external: normal', t => {
  const tracer = t.context.tracer
  const actual = parse('.. _SIG2D: http://sig2d.org/', {tracer})
  const expected = {
    ast: [
      {
        T: T.Target,
        A: {'name': 'SIG2D'},
        C: [{
          T: T.Text,
          A: {'value': 'http://sig2d.org/'}
        }]
      }
    ]
  }
  t.true(isMatch(actual, expected),
    'should parse a Target')
})

test('external: multiplel lines', t => {
  const tracer = t.context.tracer
  const actual = parse(`.. _\`[pixiv]\`: https://
   w
   w
   w.pixiv.net/`, {tracer})
  const expected = {
    ast: [
      {
        T: T.Target,
        A: {'name': '[pixiv]'},
        C: [{
          T: T.Text,
          A: {'value': 'https://www.pixiv.net/'}
        }]
      }
    ]
  }
  t.true(isMatch(actual, expected),
    'should parse a Target')
})

test('indirect: normal', t => {
  const tracer = t.context.tracer
  const actual = parse('.. _Gochiusa: gochiusa_site_', {tracer})
  const expected = {
    ast: [
      {
        T: T.Target,
        A: {'name': 'Gochiusa'},
        C: [{
          T: T.NamedHyperlink,
          A: {'name': 'gochiusa_site'},
          C: [{
            T: T.Text,
            A: {'value': 'gochiusa_site'}
          }]
        }]
      }
    ]
  }
  t.true(isMatch(actual, expected),
    'should parse a Target')
})

test('continuous', t => {
  const tracer = t.context.tracer
  const actual = parse(`.. _\`Miss You by Ento 🐺\`: miss_you_
.. _\`【Sharlo】なんでもないや -piano arrange-\`: https://soundcloud.com/sharlosharlo/nan_demo_naiya`, {tracer})
  const expected = {
    ast: [
      {
        T: T.Target,
        A: {'name': 'Miss You by Ento 🐺'},
        C: [{
          T: T.NamedHyperlink,
          A: {'name': 'miss_you'},
          C: [{
            T: T.Text,
            A: {'value': 'miss_you'}
          }]
        }]
      },
      {
        T: T.Target,
        A: {'name': '【Sharlo】なんでもないや -piano arrange-'},
        C: [{
          T: T.Text,
          A: {'value': 'https://soundcloud.com/sharlosharlo/nan_demo_naiya'}
        }]
      }
    ]
  }
  t.true(isMatch(actual, expected),
    'should parse a Target')
})

test('anonymous', t => {
  const tracer = t.context.tracer
  const actual = parse('.. __: https://soundcloud.com/shadic-the-hedgehog/usao-miracle-5ympho-x-extended-mix', {tracer})
  const expected = {
    ast: [
      {
        T: T.Target,
        C: [{
          T: T.Text,
          A: {'value': 'https://soundcloud.com/shadic-the-hedgehog/usao-miracle-5ympho-x-extended-mix'}
        }]
      }
    ]
  }
  t.true(isMatch(actual, expected),
    'should parse a Target')
})
