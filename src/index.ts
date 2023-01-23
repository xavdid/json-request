// can remove when fetch is non-experimental
// maybe Node 20?
import fetch, { type RequestInit, Headers } from 'node-fetch'

const jsonMime = 'application/json'

type METHOD = 'GET' | 'POST' | 'PATCH'

interface Options {
  // these can only be strings (headers object casts accordingly)
  headers?: { [k: string]: string }
  // there might be more types here
  query?: { [k: string]: string | number | boolean }
}

const sendRequest = async <Response>(
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

  if (options?.query) {
    // TODO
  }

  const payload: RequestInit = {
    method,
    headers,
  }

  if (body) {
    payload.body = JSON.stringify(body)
  }

  // send request
  const response = await fetch(url, payload)
  const data = await response.json()

  if (response.status >= 400) {
    throw new Error(
      `Got a ${response.status} response with body ${JSON.stringify(data)}`
    )
  }
  return data as Response
}

export const get = async <Response extends object>(
  url: string,
  options?: Options
): Promise<Response> => sendRequest('GET', url, undefined, options)

export const post = async <Response extends object>(
  url: string,
  body?: object,
  options?: Options
): Promise<Response> => sendRequest('POST', url, body, options)

// const j = await get(url)
// const pj = await post(url, body, {headers, query})
