import { expectType } from 'tsd'

import { get, post } from '../src/index'

// basic
expectType<Promise<object>>(get('asdf'))
// header
expectType<Promise<object>>(get('asdf', { headers: { 'x-basic': 'whatever' } }))
// @ts-expect-error - headers must be strings
expectType<Promise<object>>(get('asdf', { headers: { 'x-bad': 3 } }))
// query accepts multiple types
expectType<Promise<object>>(
  get('asdf', { query: { a: 1, b: 'qwer', c: true } })
)
// @ts-expect-error -  no nested query
expectType<Promise<object>>(get('asdf', { query: { nested: { bad: true } } }))
