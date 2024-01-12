# rest-client: a syntax sugar tool around Node fetch() API, tailored to work with typescript-is or superstruct validators

See also [Full API documentation](https://github.com/clickup/rest-client/blob/master/docs/modules.md).

## Examples

In the example below we use
[superstruct](https://www.npmjs.com/package/superstruct) library to build a
strongly typed response validator. Validator is just a function passed to
`json()` method: it must throw if the argument passed doesn't match what it
expects the value to be.

```ts
import { array, number, object, string } from "superstruct";
import RestClient from "rest-client";

// Initialized once. See RestOptions for lots of other options.
const client = new RestClient()
  .withOptions({
    timeoutMs: 1000,
    logger: (_event) => {
      /* myLogger.log(event); */
    },
  })
  .withBase("https://reqres.in");

async function main() {
  // Send individual request using superstruct as a validation backend.
  const res = await client
    .get("/api/users", { page: 2 })
    .setDebug()
    .json(
      object({
        total: number(),
        data: array(
          object({
            id: number(),
            email: string(),
          })
        ),
      })
    );
  console.log("Masked and validated response: ", res);
  // Notice that `res` is strongly typed! You won't make a typo.
  console.log("Here is a TS strongly-typed field:", res.data[0].email);
}

main().catch((e) => console.error(e));
```

The above script prints the following:

```
+++ GET https://reqres.in/api/users?page=2
+++ Accept: application/json
=== HTTP 200 (took 105 ms)
=== { data:
===    [ { id: 7,
===        email: 'michael.lawson@reqres.in',
===        first_name: 'Michael',
===        last_name: 'Lawson',
===        avatar: 'https://reqres.in/img/faces/7-image.jpg' },
===      { id: 8,
===        email: 'lindsay.ferguson@reqres.in',
===        first_name: 'Lindsay',
===        last_name: 'Ferguson',
===        avatar: 'https://reqres.in/img/faces/8-image.jpg' },
===      { id: 9,
===        email: 'tobias.funke@reqres.in',
===        first_name: 'Tobias',
===        last_name: 'Funke',
===        avatar: 'https://reqres.in/img/faces/9-image.jpg' },
===      { id: 10,
===        email: 'byron.fields@reqres.in',
===        first_name: 'Byron',
===        last_name: 'Fields',
===        avatar: 'https://reqres.in/img/faces/10-image.jpg' },
===      { id: 11,
===        email: 'george.edwards@reqres.in',
===        first_name: 'George',
===        last_name: 'Edwards',
===        avatar: 'https://reqres.in/img/faces/11-image.jpg' },
===      { id: 12,
===        email: 'rachel.howell@reqres.in',
===        first_name: 'Rachel',
===        last_name: 'Howell',
===        avatar: 'https://reqres.in/img/faces/12-image.jpg' } ],
===   page: 2,
===   per_page: 6,
===   support:
===    { url: 'https://reqres.in/#support-heading',
===      text: 'To keep ReqRes free, contributions!' },
===   total: 12,
===   total_pages: 2 }

Masked and validated response:  {
  total: 12,
  data: [
    { id: 7, email: 'michael.lawson@reqres.in' },
    { id: 8, email: 'lindsay.ferguson@reqres.in' },
    { id: 9, email: 'tobias.funke@reqres.in' },
    { id: 10, email: 'byron.fields@reqres.in' },
    { id: 11, email: 'george.edwards@reqres.in' },
    { id: 12, email: 'rachel.howell@reqres.in' }
  ]
}
Here is a TS strongly-typed field: michael.lawson@reqres.in
```

If the API response doesn't match the expected shape (e.g. we expect "other_field" to be presented too), superstruct will throw a descriptive message:

```
StructError: At path: data.0.other_field -- Expected a number, but received: undefined
```

## Validation Backends

You can use one of the following libraries to type-enforce the response:
- [typescript-is](https://www.npmjs.com/package/typescript-is)
- [superstruct](https://www.npmjs.com/package/superstruct)
- any other solution which can validate TS object shape against a JSON
