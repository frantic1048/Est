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

test('normal URL', t => {
  const tracer = t.context.tracer
  const actual = parse('ftp://ftp.is.co.za/rfc/rfc1808.txt', {tracer})
  const expected = {
    ast: [{
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
    }]
  }
  t.true(isMatch(actual, expected), 'should parse as StandAloneHyperlink')
})

test('IPv4 URL', t => {
  const tracer = t.context.tracer
  const actual = parse('ftp://10.0.0.55/rfc/rfc1808.txt', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.StandAloneHyperlink,
        A: {ref: 'ftp://10.0.0.55/rfc/rfc1808.txt'},
        C: [
          {
            T: T.Text,
            A: {
              value: 'ftp://10.0.0.55/rfc/rfc1808.txt'
            }
          }
        ]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse as StandAloneHyperlink')
})

test('port, fragment and query', t => {
  const tracer = t.context.tracer
  const actual = parse('foo://example.com:8042/over/there?name=ferret#nose', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.StandAloneHyperlink,
        A: {ref: 'foo://example.com:8042/over/there?name=ferret#nose'},
        C: [
          {
            T: T.Text,
            A: {
              value: 'foo://example.com:8042/over/there?name=ferret#nose'
            }
          }
        ]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse as StandAloneHyperlink')
})

test('IPv4-mapped IPv6 addresses', t => {
  const tracer = t.context.tracer
  const actual = parse('ldap://[::ffff:192.0.2.128]/c=GB?objectClass?one', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.StandAloneHyperlink,
        A: {ref: 'ldap://[::ffff:192.0.2.128]/c=GB?objectClass?one'},
        C: [
          {
            T: T.Text,
            A: {
              value: 'ldap://[::ffff:192.0.2.128]/c=GB?objectClass?one'
            }
          }
        ]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse as StandAloneHyperlink')
})

test('IPv6 rule1', t => {
  const tracer = t.context.tracer
  const actual = parse('ldap://[db8:db8:db8:db8:db8:db8:db8:db8]/c=GB?objectClass?one', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.StandAloneHyperlink,
        A: {ref: 'ldap://[db8:db8:db8:db8:db8:db8:db8:db8]/c=GB?objectClass?one'},
        C: [
          {
            T: T.Text,
            A: {
              value: 'ldap://[db8:db8:db8:db8:db8:db8:db8:db8]/c=GB?objectClass?one'
            }
          }
        ]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse as StandAloneHyperlink')
})

test('IPv6 rule2', t => {
  const tracer = t.context.tracer
  const actual = parse('ldap://[::db8:db8:db8:db8:db8:db8:db8]/c=GB?objectClass?one', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.StandAloneHyperlink,
        A: {ref: 'ldap://[::db8:db8:db8:db8:db8:db8:db8]/c=GB?objectClass?one'},
        C: [
          {
            T: T.Text,
            A: {
              value: 'ldap://[::db8:db8:db8:db8:db8:db8:db8]/c=GB?objectClass?one'
            }
          }
        ]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse as StandAloneHyperlink')
})

test('IPv6 rule3', t => {
  const tracer = t.context.tracer
  const actual = parse('ldap://[2001::db8:db8:db8:db8:db8:db8]/c=GB?objectClass?one', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.StandAloneHyperlink,
        A: {ref: 'ldap://[2001::db8:db8:db8:db8:db8:db8]/c=GB?objectClass?one'},
        C: [
          {
            T: T.Text,
            A: {
              value: 'ldap://[2001::db8:db8:db8:db8:db8:db8]/c=GB?objectClass?one'
            }
          }
        ]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse as StandAloneHyperlink')
})

test('IPv6 rule4', t => {
  const tracer = t.context.tracer
  const actual = parse('ldap://[2001:db8::db8:db8:db8:db8:db8]/c=GB?objectClass?one', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.StandAloneHyperlink,
        A: {ref: 'ldap://[2001:db8::db8:db8:db8:db8:db8]/c=GB?objectClass?one'},
        C: [
          {
            T: T.Text,
            A: {
              value: 'ldap://[2001:db8::db8:db8:db8:db8:db8]/c=GB?objectClass?one'
            }
          }
        ]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse as StandAloneHyperlink')
})

test('IPv6 rule5', t => {
  const tracer = t.context.tracer
  const actual = parse('ldap://[2001:db8::db8:db8:db8:db8]/c=GB?objectClass?one', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.StandAloneHyperlink,
        A: {ref: 'ldap://[2001:db8::db8:db8:db8:db8]/c=GB?objectClass?one'},
        C: [
          {
            T: T.Text,
            A: {
              value: 'ldap://[2001:db8::db8:db8:db8:db8]/c=GB?objectClass?one'
            }
          }
        ]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse as StandAloneHyperlink')
})

test('IPv6 rule6', t => {
  const tracer = t.context.tracer
  const actual = parse('ldap://[2001:db8::db8:db8:db8]/c=GB?objectClass?one', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.StandAloneHyperlink,
        A: {ref: 'ldap://[2001:db8::db8:db8:db8]/c=GB?objectClass?one'},
        C: [
          {
            T: T.Text,
            A: {
              value: 'ldap://[2001:db8::db8:db8:db8]/c=GB?objectClass?one'
            }
          }
        ]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse as StandAloneHyperlink')
})

test('IPv6 rule7', t => {
  const tracer = t.context.tracer
  const actual = parse('ldap://[2001:db8::db8:db8]/c=GB?objectClass?one', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.StandAloneHyperlink,
        A: {ref: 'ldap://[2001:db8::db8:db8]/c=GB?objectClass?one'},
        C: [
          {
            T: T.Text,
            A: {
              value: 'ldap://[2001:db8::db8:db8]/c=GB?objectClass?one'
            }
          }
        ]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse as StandAloneHyperlink')
})

test('IPv6 rule8', t => {
  const tracer = t.context.tracer
  const actual = parse('ldap://[2001:db8::db8]/c=GB?objectClass?one', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.StandAloneHyperlink,
        A: {ref: 'ldap://[2001:db8::db8]/c=GB?objectClass?one'},
        C: [
          {
            T: T.Text,
            A: {
              value: 'ldap://[2001:db8::db8]/c=GB?objectClass?one'
            }
          }
        ]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse as StandAloneHyperlink')
})

test('IPv6 rule9', t => {
  const tracer = t.context.tracer
  const actual = parse('ldap://[2001:db8::]/c=GB?objectClass?one', {tracer})
  const expected = {
    ast: [{
      T: T.Paragraph,
      C: [{
        T: T.StandAloneHyperlink,
        A: {ref: 'ldap://[2001:db8::]/c=GB?objectClass?one'},
        C: [
          {
            T: T.Text,
            A: {
              value: 'ldap://[2001:db8::]/c=GB?objectClass?one'
            }
          }
        ]
      }]
    }]
  }
  t.true(isMatch(actual, expected), 'should parse as StandAloneHyperlink')
})

test.todo('bare email adress')
