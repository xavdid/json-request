import nock = require('nock')
import { ResponseError } from '../error'
import {
  getJSON,
  isHTTPError,
  isJSONError,
  isResponseError,
  postJSON,
} from '../index'

const URL = 'https://example.com'
const BODY = { a: 1, b: 'qwer', c: true }

describe('mocked', () => {
  describe('methods', () => {
    describe('get', () => {
      it('should load JSON without arguments', async () => {
        nock(URL).get('/basic').reply(200, BODY)

        await expect(getJSON(`${URL}/basic`)).resolves.toEqual(BODY)
      })

      it('should handle array wrapped json JSON without arguments', async () => {
        nock(URL).get('/basic').reply(200, [BODY])

        await expect(getJSON(`${URL}/basic`)).resolves.toEqual([BODY])
      })

      it('should raise errors for invalid JSON', async () => {
        nock(URL).get('/error').reply(200, 'not json')

        await expect(getJSON(`${URL}/error`)).rejects.toThrow(
          'invalid json response body'
        )
      })

      it('should throw a custom object on a bad status', async () => {
        nock(URL).get('/error').reply(404, { error: 'missing' })

        let err: ResponseError | undefined

        try {
          await getJSON(`${URL}/error`)
        } catch (e) {
          err = e as ResponseError
        }

        expect(err).toBeDefined()
        expect(err).toBeInstanceOf(ResponseError)
        expect(err?.code).toEqual('HTTP_ERROR')
        expect(err?.statusCode).toEqual(404)
        expect(err?.body).toEqual({ error: 'missing' })
      })

      it('should throw a custom object on a bad json response', async () => {
        nock(URL).get('/error').reply(400, 'not json')

        let err: ResponseError | undefined

        try {
          await getJSON(`${URL}/error`)
        } catch (e) {
          err = e as ResponseError
        }

        expect(err).toBeDefined()
        expect(err).toBeInstanceOf(ResponseError)
        expect(err?.code).toEqual('JSON_PARSE_ERROR')
        expect(err?.statusCode).toEqual(400)
        expect(err?.body).toEqual('not json')
      })
    })

    describe('post', () => {
      it('should allow a blank body', async () => {
        nock(URL)
          .post('/basic', (body) => {
            // only matches non-existant bodies
            return body === ''
          })
          .reply(200, BODY)

        await expect(postJSON(`${URL}/basic`, undefined)).resolves.toEqual(BODY)
      })

      it('should allow an empty body', async () => {
        nock(URL).post('/basic', {}).reply(200, BODY)

        await expect(postJSON(`${URL}/basic`, {})).resolves.toEqual(BODY)
      })

      it('should pass a body', async () => {
        nock(URL).post('/basic', BODY).reply(200, BODY)

        await expect(postJSON(`${URL}/basic`, BODY)).resolves.toEqual(BODY)
      })
    })

    describe('query params', () => {
      it('should add query params to url', async () => {
        nock(URL).get('/params').query(BODY).reply(200, BODY)

        await expect(
          getJSON(`${URL}/params`, { query: BODY })
        ).resolves.toEqual(BODY)
      })

      it('should merge query to url with existing query', async () => {
        nock(URL).get('/params').query(BODY).reply(200, BODY)

        await expect(
          getJSON(`${URL}/params?a=1`, { query: { b: 'qwer', c: true } })
        ).resolves.toEqual(BODY)
      })

      it('should prioritize the existing url over the query object', async () => {
        nock(URL).get('/params').query({ a: '1' }).reply(200, BODY)

        await expect(
          getJSON(`${URL}/params?a=1`, { query: { a: '2' } })
        ).resolves.toEqual(BODY)
      })

      it('should encode query params correctly', async () => {
        nock(URL)
          .get('/params')
          .query({ withSpaces: 'no kidding' })
          .reply(200, BODY)

        await expect(
          getJSON(`${URL}/params`, { query: { withSpaces: 'no kidding' } })
        ).resolves.toEqual(BODY)
      })
    })

    describe('headers', () => {
      it('should set default headers', async () => {
        nock(URL, {
          reqheaders: {
            'content-type': 'application/json',
            accept: 'application/json',
          },
        })
          .get('/headers')
          .reply(200, BODY)

        await expect(getJSON(`${URL}/headers`)).resolves.toEqual(BODY)
      })

      it('should pass headers through', async () => {
        nock(URL, {
          reqheaders: {
            'content-type': 'application/json',
            accept: 'application/json',
            'x-bonus': 'asdf',
          },
        })
          .get('/headers')
          .reply(200, BODY)

        await expect(
          getJSON(`${URL}/headers`, { headers: { 'x-bonus': 'asdf' } })
        ).resolves.toEqual(BODY)
      })

      it('should not overwrite content-type header', async () => {
        nock(URL, {
          reqheaders: {
            'content-type': 'application/json',
          },
        })
          .get('/headers')
          .reply(200, BODY)

        await expect(
          getJSON(`${URL}/headers`, {
            headers: { 'content-type': 'application/xml' },
          })
        ).resolves.toEqual(BODY)
      })
    })
  })
  describe('error utils', () => {
    it('should recognize response errors', () => {
      const e = new ResponseError('', 'JSON_PARSE_ERROR', 123, '')
      expect(isResponseError(e)).toEqual(true)
    })
    it('should recognize json errors', () => {
      const e = new ResponseError('', 'JSON_PARSE_ERROR', 123, '')
      expect(isJSONError(e)).toEqual(true)
    })
    it('should recognize http errors', () => {
      const e = new ResponseError('', 'HTTP_ERROR', 123, {})
      expect(isHTTPError(e)).toEqual(true)
    })
  })
})

describe('live tests', () => {
  it('should get json', async () => {
    const data = await getJSON('https://jsonplaceholder.typicode.com/todos/1')
    expect(data).toEqual({
      completed: false,
      id: 1,
      title: 'delectus aut autem',
      userId: 1,
    })
  })

  it('should post json', async () => {
    const data = await postJSON('https://jsonplaceholder.typicode.com/posts', {
      title: 'foo',
      body: 'bar',
      userId: 1,
    })
    expect(data).toEqual({
      body: 'bar',
      id: 101,
      title: 'foo',
      userId: 1,
    })
  })

  it('should load array-based json', async () => {
    const data = await getJSON('https://jsonplaceholder.typicode.com/todos')
    expect(data).toHaveLength(200)
  })

  it('should send query params', async () => {
    const data = await getJSON('https://jsonplaceholder.typicode.com/todos', {
      query: { _limit: 10 },
    })
    expect(data).toHaveLength(10)
  })

  it('should send headers and query', async () => {
    const data = await getJSON<any>('https://httpbin.org/get', {
      headers: {
        authorization: 'Basic eGF2ZGlkOmh1bnRlcjI=',
      },
      query: { name: 'test', num: 23 },
    })

    expect(data.args).toEqual({ name: 'test', num: '23' })

    expect(data.headers.Authorization).toEqual('Basic eGF2ZGlkOmh1bnRlcjI=')
    expect(data.headers.Accept).toEqual('application/json')
    expect(data.headers['Content-Type']).toEqual('application/json')
  })

  it('should send a body', async () => {
    const data = await postJSON<any>('https://httpbin.org/post', {
      name: 'david',
    })

    expect(JSON.parse(data.data)).toEqual({ name: 'david' })
  })

  it('should throw for invalid json', async () => {
    await expect(getJSON('https://httpbin.org/xml')).rejects.toThrow(
      'invalid json response body'
    )
  })
})
