import nock = require('nock')
import { get, post } from '../index'

const URL = 'https://example.com'
const BODY = { a: 1, b: 'qwer', c: true }

describe('methods', () => {
  describe('get', () => {
    it('should load JSON without arguments', () => {
      nock(URL).get('/basic').reply(200, BODY)

      return expect(get(`${URL}/basic`)).resolves.toEqual(BODY)
    })

    it('should raise errors for invalid JSON', () => {
      nock(URL).get('/error').reply(200, 'not json')

      return expect(get(`${URL}/error`)).rejects.toThrow(
        'invalid json response body'
      )
    })

    it('should throw for status', () => {
      nock(URL).get('/error').reply(404, { error: 'missing' })

      return expect(get(`${URL}/error`)).rejects.toThrow(
        'Got a 404 response with body {'
      )
    })
  })

  describe('post', () => {})

  describe('query params', () => {
    it('should query headers to url', () => {
      nock(URL).get('/params').query(BODY).reply(200, BODY)

      return expect(get(`${URL}/params`, { query: BODY })).resolves.toEqual(
        BODY
      )
    })

    it('should merge query to url with existing query', () => {
      nock(URL).get('/params').query(BODY).reply(200, BODY)

      return expect(
        get(`${URL}/params?a=1`, { query: { b: 'qwer', c: true } })
      ).resolves.toEqual(BODY)
    })

    it('should encode query params correctly', () => {
      nock(URL)
        .get('/params')
        .query({ withSpaces: 'no kidding' })
        .reply(200, BODY)

      return expect(
        get(`${URL}/params`, { query: { withSpaces: 'no kidding' } })
      ).resolves.toEqual(BODY)
    })
  })

  describe('headers', () => {
    it('should set default headers', () => {
      nock(URL, {
        reqheaders: {
          'content-type': 'application/json',
          accept: 'application/json',
        },
      })
        .get('/headers')
        .reply(200, BODY)

      return expect(get(`${URL}/headers`)).resolves.toEqual(BODY)
    })

    it('should pass headers through', () => {
      nock(URL, {
        reqheaders: {
          'content-type': 'application/json',
          accept: 'application/json',
          'x-bonus': 'asdf',
        },
      })
        .get('/headers')
        .reply(200, BODY)

      return expect(
        get(`${URL}/headers`, { headers: { 'x-bonus': 'asdf' } })
      ).resolves.toEqual(BODY)
    })

    it('should not overwrite content-type header', () => {
      nock(URL, {
        reqheaders: {
          'content-type': 'application/json',
        },
      })
        .get('/headers')
        .reply(200, BODY)

      return expect(
        get(`${URL}/headers`, {
          headers: { 'content-type': 'application/xml' },
        })
      ).resolves.toEqual(BODY)
    })
  })
})
