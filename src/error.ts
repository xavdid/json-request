type HTTP_ERROR = 'HTTP_ERROR'
type JSON_PARSE_ERROR = 'JSON_PARSE_ERROR'

type ERROR_CODES = HTTP_ERROR | JSON_PARSE_ERROR

type BodyTypeForCode<Code extends ERROR_CODES> = Code extends HTTP_ERROR
  ? object
  : Code extends JSON_PARSE_ERROR
  ? string
  : never

export class ResponseError<
  Code extends ERROR_CODES = ERROR_CODES
> extends Error {
  constructor(
    /**
     * a human-readable message describing the issue
     */
    public message: string,
    /**
     * A programatically stable string for narrowing the exact type of error
     */
    public code: Code,
    /**
     * The HTTP response code
     */
    public statusCode: number,
    /**
     * As much data as we can get from the body - an object if `JSON.parse` succeeded, or a `string` if it didn't.
     */
    public body: BodyTypeForCode<Code>
  ) {
    super(message)
  }
}

// this type (and accompanying guard) ensure that `.body` is
// correctly typed in catches
type BaseErrorShape = Omit<ResponseError, 'code' | 'body'>
type ResponseErrorLike<Code extends ERROR_CODES = ERROR_CODES> =
  Code extends ERROR_CODES
    ? { code: Code; body: BodyTypeForCode<Code> } & BaseErrorShape
    : never

// util guards
// created manually for now
export const isResponseError = (e: unknown): e is ResponseErrorLike => {
  return e instanceof ResponseError
}

export const isHTTPError = (
  error: unknown
): error is ResponseErrorLike<HTTP_ERROR> =>
  isResponseError(error) && error.code === 'HTTP_ERROR'

export const isJSONError = (
  error: unknown
): error is ResponseErrorLike<JSON_PARSE_ERROR> =>
  isResponseError(error) && error.code === 'JSON_PARSE_ERROR'
