import { expectType } from 'tsd'

import { getJSON, postJSON } from '../src/index'

// GET

// basic
expectType<Promise<object>>(getJSON('asdf'))
// header
expectType<Promise<object>>(
  getJSON('asdf', { headers: { 'x-basic': 'whatever' } })
)
// @ts-expect-error - headers must be strings
expectType<Promise<object>>(getJSON('asdf', { headers: { 'x-bad': 3 } }))
// query accepts multiple types
expectType<Promise<object>>(
  getJSON('asdf', { query: { a: 1, b: 'qwer', c: true } })
)
// query and headers
expectType<Promise<object>>(
  getJSON('asdf', {
    query: { a: 1, b: 'qwer', c: true },
    headers: { 'x-whatever': 'something' },
  })
)
expectType<Promise<object>>(
  // @ts-expect-error -  no nested query
  getJSON('asdf', { query: { nested: { bad: true } } })
)

// return type
expectType<Promise<{ name: string; age: number }>>(
  getJSON<{ name: string; age: number }>('asdf')
)
// type mismatch
expectType<Promise<{ name: string; age: number }>>(
  // @ts-expect-error
  getJSON<{ name: string; age: string }>('asdf')
)

// POST

// no body is fine, but has to be explicit
expectType<Promise<object>>(postJSON('asdf', undefined))
// @ts-expect-error - have to supply even a blank body
expectType<Promise<object>>(postJSON('asdf'))
// basic body is fine
expectType<Promise<object>>(postJSON('asdf', {}))
// any structure is ok as body
expectType<Promise<object>>(
  postJSON('asdf', { whatever: { isFine: true, list: [1, 2, 3], cool: 'yes' } })
)
// any structure is ok as body
expectType<Promise<{ name: string; age: number }>>(
  postJSON('asdf', { whatever: { isFine: true, list: [1, 2, 3], cool: 'yes' } })
)
// header
expectType<Promise<object>>(
  postJSON('asdf', undefined, { headers: { 'x-basic': 'whatever' } })
)
// @ts-expect-error - headers must be strings
expectType<Promise<object>>(postJSON('asdf', {}, { headers: { 'x-bad': 3 } }))
// query accepts multiple types
expectType<Promise<object>>(
  postJSON('asdf', {}, { query: { a: 1, b: 'qwer', c: true } })
)
// query and headers
expectType<Promise<object>>(
  postJSON(
    'asdf',
    {},
    {
      query: { a: 1, b: 'qwer', c: true },
      headers: { 'x-whatever': 'something' },
    }
  )
)
expectType<Promise<object>>(
  // @ts-expect-error -  no nested query
  postJSON('asdf', {}, { query: { nested: { bad: true } } })
)
