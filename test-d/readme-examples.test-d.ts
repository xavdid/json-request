import {
  getJSON,
  isHTTPError,
  isJSONError,
  isResponseError,
  postJSON,
} from '../src'
// ---
// GET

// ```
// import { getJSON } from '@xavdid/json-requests'

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
console.log(todo.title) // "delectus aut autem"

// POST

// import { postJSON } from '@xavdid/json-requests'

// type Todo = {
//   userId: number
//   id: number
//   title: string
//   completed: boolean
// }

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
// `todo` is correctly typed
console.log(updatedTodo.title) // "foo"
// ```

// OPTIONS

// ```
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
// ```

// ERROR HANDLING

// ```
// import { getJSON, isJSONError, isHTTPError } from '@xavdid/json-requests'

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
// ```
