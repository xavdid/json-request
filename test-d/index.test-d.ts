import { expectType } from 'tsd'
import { ResponseError } from '../src/error'
import {
  getJSON,
  isHTTPError,
  isJSONError,
  isResponseError,
  postJSON,
} from '../src/index'

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

// @ts-expect-error - ASDF is not a valid code
new ResponseError('', 'ADSF', 123, {})
// @ts-expect-error - last arg should be an object, not a string
new ResponseError('', 'HTTP_ERROR', 123, 'adsf')
// @ts-expect-error - last arg should be a string, not an object
new ResponseError('', 'JSON_PARSE_ERROR', 123, {})

// correct creation
new ResponseError('', 'HTTP_ERROR', 123, {})
new ResponseError('', 'JSON_PARSE_ERROR', 123, 'asdf')

try {
} catch (e) {
  // with basic narrowing
  if (isResponseError(e)) {
    expectType<number>(e.statusCode)
    expectType<string>(e.code)
    expectType<string | object>(e.body)

    if (e.code === 'JSON_PARSE_ERROR') {
      expectType<'JSON_PARSE_ERROR'>(e.code)
      expectType<string>(e.body)
    } else {
      expectType<'HTTP_ERROR'>(e.code)
      expectType<object>(e.body)
    }
  }

  // with fancy narrowing
  if (isHTTPError(e)) {
    expectType<'HTTP_ERROR'>(e.code)
    expectType<object>(e.body)
  }
  if (isJSONError(e)) {
    expectType<'JSON_PARSE_ERROR'>(e.code)
    expectType<string>(e.body)
  }
}
