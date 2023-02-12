// can remove when fetch is non-experimental
// maybe Node 20?
import fetch, { Headers, type RequestInit } from 'node-fetch'
import { parse, stringify } from 'node:querystring'
import { ResponseError } from './error'

const jsonMime = 'application/json'

type METHOD = 'GET' | 'POST' | 'PATCH'

export interface Options {
  // these can only be strings (headers object casts accordingly)
  headers?: { [k: string]: string }
  // there might be more types here
  query?: { [k: string]: string | number | boolean }
}

export const sendRequest = async <Response>(
  method: METHOD,
  url: string,
  // this isn't technically true, but it's fine for our purposes
  // see https://github.com/sindresorhus/type-fest/blob/1c293f1cd2c1b2e9f95de5001e0c29544a8033b9/source/basic.d.ts#L15-L45
  // and https://github.com/Microsoft/TypeScript/issues/1897#issuecomment-710744173
  body?: object,
  options?: Options
): Promise<Response> => {
  // Prep
  const headers = new Headers({ ...options?.headers })

  // JSON only!
  headers.set('content-type', jsonMime)
  headers.set('accept', jsonMime)

  if (options?.query != null) {
    if (url.includes('?')) {
      const [baseUrl, qs] = url.split('?', 2)
      const parsed = parse(qs)
      url = `${baseUrl}?${stringify({ ...options.query, ...parsed })}`
    } else {
      url += `?${stringify(options.query)}`
    }
  }

  const payload: RequestInit = {
    method,
    headers,
  }

  if (body != null) {
    payload.body = JSON.stringify(body)
  }

  // send request
  const response = await fetch(url, payload)

  const bodyText = await response.text() // I _think_ this basically always works (but may not be JSON)
  let data

  try {
    data = await JSON.parse(bodyText)
  } catch {
    throw new ResponseError(
      `invalid json response body: "${bodyText}"`,
      'JSON_PARSE_ERROR',
      response.status,
      bodyText
    )
  }

  if (response.status >= 400) {
    throw new ResponseError(
      `Got a ${response.status} response with body ${JSON.stringify(data)}`,
      'HTTP_ERROR',
      response.status,
      data
    )
  }
  return data as Response
}
