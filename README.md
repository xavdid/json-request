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

Each method returns a `Promise` that resolves to the JSON response from the server. Each method will also throw an error if the response `status` is `>= 400`.

### getJSON

```ts
function getJSON(url: string, options?: Options): Promise<Response extends object>
```

#### Examples

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

If the server doesn't return valid JSON, it'll fail to parse with a standard `SyntaxError`. If the server returns a status `>= 400`, an `Error` will be thrown manually. This is not configurable, so if bad status codes are expected in your application, make sure to catch the errors manually.
