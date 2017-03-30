import test from 'ava'

import est from '../'

test('foo', t => {
  t.pass()
})

test('paragraph', t => {
  t.truthy(est(`para
    para1

    para2
    para`))
})
