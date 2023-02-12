import { sendRequest, type Options } from './request'

export { isHTTPError, isJSONError, isResponseError } from './error'
export { type Options } from './request'

export const getJSON = async <Response extends object>(
  url: string,
  options?: Options
): Promise<Response> => await sendRequest('GET', url, undefined, options)

export const postJSON = async <Response extends object>(
  url: string,
  body: object | undefined,
  options?: Options
): Promise<Response> => await sendRequest('POST', url, body, options)
