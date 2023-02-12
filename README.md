# json-requests

This is a simple, modern, ergonomic, **JSON-only** HTTP request client.

The package is intentionally light on features and configuration. Responses (and outgoing bodies, if applicable) **must** be JSON - if you need a different response type, use a different package.

It will soon have no external runtime dependencies. At time of writing, it wraps `node-fetch`, but once `fetch` is natively available in Node.js, that dependency will be removed.

## Installation

The package is available on [npm](https://www.npmjs.com/package/@xavdid/json-requests); install it via your favorite package manager:

```sh
yarn add @xavdid/json-requests
```

## Usage

Usage is intentionally simple. Each method takes a `url` to start and `Options` to end. The `postJSON` method also takes a `body` in middle.

Each method returns a `Promise` that resolves to the JSON response from the server. Each method will also throw an error if the response status is `>= 400` or the response isn't valid JSON. See [error handling](#error-handling)) for more info.

### getJSON

```ts
function getJSON(url: string, options?: Options): Promise<Response extends object>
```

#### Examples

<!-- these are copied from `readme-examples.test-d.ts`! -->

```ts
import { getJSON } from '@xavdid/json-requests'

// within an async function

// you can give the response shape in the function call
type Todo = {
  userId: number
  id: number
  title: string
  completed: boolean
}
const todo = await getJSON<Todo>('https://jsonplaceholder.typicode.com/todos/1')

// `todo` is correctly typed
console.log(todo.title) // "some title"
```

### postJSON

```ts
function postJSON(
    url: string,
    body: object | undefined,
    options?: Options
): Promise<Response extends object>
```

#### Examples

<!-- these are copied from `readme-examples.test-d.ts`! -->

```ts
import { postJSON } from '@xavdid/json-requests'

type Todo = {
  userId: number
  id: number
  title: string
  completed: boolean
}

// within an async function

// you can give the response shape in the function call
const updatedTodo = await postJSON<Todo>(
  'https://jsonplaceholder.typicode.com/posts',
  {
    title: 'foo',
    body: 'bar',
    userId: 1,
  }
)
// `updatedTodo` is correctly typed
console.log(updatedTodo.title) // "foo"
```

### Options

The `Options` object takes two optional keys:

```ts
interface Options {
  // these can only be strings (headers object casts accordingly)
  headers?: { [k: string]: string }
  // there might be more types here
  query?: { [k: string]: string | number | boolean }
}
```

The `accept` and `content-type` headers are set automatically (and irrevocably).

These types intended to cover basic use; let me know if there's a common case that the types complain about.

```ts
// in an async function

// put query params in the object, not the url
const data = await getJSON('https://jsonplaceholder.typicode.com/todos', {
  query: { _limit: 10 },
})
// `data` has length 10

// pass auth as normal
const withAuth = await getJSON('https://httpbin.org/get', {
  headers: {
    authorization: 'Basic eGF2ZGlkOmh1bnRlcjI=',
  },
})
```

#### Examples

### Error Handling

This package raises a custom error class, the `ResponseError`. It's thrown in 2 cases:

1. The response content isn't valid JSON
2. The server returns a status code `>= 400`

The error object has the following properties:

- `message`: a human-readable description of the problem
- `code`: a reliable string which pinpoints the issue. Useful for narrowing down the problem programmatically (much like [Node.js error codes](https://nodejs.org/api/errors.html#errors_error_code)). Possible values are:
  - `JSON_PARSE_ERROR`
  - `HTTP_ERROR`
- `statusCode`: the numeric HTTP response code
- `body`: the response's body content. If the response was valid JSON, it'll be parsed. If not (`code` is `JSON_PARSE_ERROR`), it's a string. There are helper functions to help type this for you (see below)

Any other errors will be thrown normally.

#### Narrowing Functions

The package includes helper functions to improve the typing of thrown errors:

- `isJSONError(e): boolean`: narrows to a single possible error type
- `isHTTPError(e): boolean`: narrows to a single possible error type
- `isResponseError(e): boolean` will let you know an error is any of the above (as opposed to a native or fetch-based error). Useful for safely accessing `.statusCode` or treating unknown errors differently

#### Examples

<!-- these are copied from `readme-examples.test-d.ts`! -->

```ts
import { getJSON, isJSONError, isHTTPError } from '@xavdid/json-requests'

// within an async function

try {
  await getJSON('https://httpbin.org/xml')
} catch (e) {
  if (isJSONError(e)) {
    e.body // <-- string; response that's not parsable JSON, like "<xml>...</xml>"
  }
  if (isHTTPError(e)) {
    e.body // <-- object; parsed error response, like {error: "unable to X"}
  }

  if (isResponseError(e)) {
    // can be either of the above, but not a native error
    e.message // string; human readable message
    e.statusCode // number
    e.code // string; one of the above
  }
}
```
