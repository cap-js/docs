---
shorty: cds.test
# synopsis: How test CAP Node.js applications.
status: released
---

# Testing

Learn more about best practices to test CAP Node.js applications using the `cds.test` toolkit.
Find samples for such tests in [cap/samples](https://github.com/sap-samples/cloud-cap-samples/tree/master/test) and in [CAP SFLIGHT app](https://github.com/SAP-samples/cap-sflight/tree/main/test).

For more details how to test Java applications, see the [Java documentation](../java/development/#testing-cap-java-applications).




## Preliminaries

Add optional dependencies required by `cds.test`:

```sh
npm add -D axios chai chai-as-promised chai-subset jest
```

::: tip
If you have cloned [cap/samples]( https://github.com/sap-samples/cloud-cap-samples), you get that for free.
:::


## Running a CAP Server

Use function `cds.test()` to easily launch and test a CAP server as follows:

```js{3}
const project = __dirname+'/..' // The project's root folder
const cds = require('@sap/cds/lib')
cds.test(project)
```
[Learn more about tests in the SFLIGHT app.](https://github.com/SAP-samples/cap-sflight/blob/main/test/odata.test.js){.learn-more}

##### Behind the Scenes `cds.test()` ...

- Ensures the server is launched before tests (&rarr; in `before()`/`beforeAll()` hooks)
- With the equivalent of `cds serve --project <...> --in-memory?` cli command
- With a controlled shutdown when all tests have finished

##### Running in a Specific Folder

By default, the `cds` APIs read files from the current working directory. To run test simulating whole projects, use `cds.test.in(<...>)` to specify the test project's root folder.

```js{2}
const cds = require('@sap/cds/lib')
cds.test.in(__dirname)
```

For example, this would have `cds.env` loading the configuration from _package.json_ and _.cdsrc.json_ files found next to the test file, that is, in the same folder.

::: danger
**Important:** Don't use `process.chdir()` in Jest tests, as they may leave test containers in screwed state, leading to failing subsequent tests.
:::

::: tip
Prefer using relative filenames derived from `__dirname` as arguments to `cds.test` to allow your tests be started from whatever working directory.
:::


##### Silenced Server Log

To reduce noise, `cds.test()` by default suppresses the usual bootstrap output of `cds serve`. You can skip this silent mode programmatically like that:

```js
cds.test(project).verbose()
```

Or by setting process env variable `CDS_TEST_VERBOSE`, for example like that from the command line:

::: code-group

```bash [Mac/Linux]
CDS_TEST_VERBOSE=y mocha
```

```cmd [Windows]
set CDS_TEST_VERBOSE=y
mocha
```

```powershell [Windows Powershell]
$Env:CDS_TEST_VERBOSE=y
mocha
```

:::

To get a completely clutter-free log, check out the test runners for such a feature, like [jest --silent](https://jestjs.io/docs/cli#--silent).


## Testing Service APIs

As `cds.test()` launches the server in the current process, you can access all services programmatically using the respective [Node.js APIs](services).
Here is an example for that taken from [cap/samples](https://github.com/SAP-samples/cloud-cap-samples/blob/a8345122ea5e32f4316fe8faef9448b53bd097d4/test/consuming-services.test.js#L2):

```js
it('Allows testing programmatic APIs', async () => {
  const AdminService = await cds.connect.to('AdminService')
  const { Authors } = AdminService.entities
  expect (await SELECT.from(Authors))
  .to.eql(await AdminService.read(Authors))
  .to.eql(await AdminService.run(SELECT.from(Authors)))
})
```


## Testing HTTP APIs

To test HTTP APIs we can use the test object returned by `cds.test()`, which uses `axios` and mirrors the axios API methods like `.get()`, `.put()`, `.post()` etc.

```js{2-3}
const test = cds.test('@capire/bookshop')
const {data} = await test.get('/browse/Books', { // [!code focus]
  params: { $search: 'Po', $select: `title,author`
}})
```

[Learn more about the axios APIs.](https://axios-http.com){.learn-more}

In addition we provide uppercase bound function variants like `GET` or `POST`, which allow this usage variant:

```js{3,6}
const { GET, POST } = cds.test('@capire/bookshop')
const input = 'Wuthering Heights' // simulating user input
const order = await POST (`/browse/submitOrder`, { // [!code focus]
  book: 201, quantity: 5
})
const { data } = await GET ('/browse/Books', { // [!code focus]
  params: { $search: 'Po', $select: `title,author`
}})
```


## Using Mocha or Jest

Mocha and Jest are the most used test runners at the moment, with each having its fan base.
The `cds.test` library is designed to write tests that run with both, as shown in the following sample code:

```js
const { GET, expect } = cds.test('@capire/bookshop')
describe('my test suite', ()=>{
  beforeAll(()=>{ })  // Jest style
  before(()=>{ })     // Mocha style
  test ('something', ()=>{}) // Jest style
  it ('should test', ()=>{ // Jest & Mocha style
    const { data } = await GET ('/browse/Books', {
      params: { $search: 'Po', $select: `title,author` }
    })
    expect(data.value).to.eql([ // Chai tests, working in Jest and Mocha
      { ID: 201, title: 'Wuthering Heights', author: 'Emily Brontë' },
      { ID: 207, title: 'Jane Eyre', author: 'Charlotte Brontë' },
      { ID: 251, title: 'The Raven', author: 'Edgar Allen Poe' },
      { ID: 252, title: 'Eleonora', author: 'Edgar Allen Poe' },
    ])
  })
})
```

To be portable, you need to use a specific implementation of `expect`, like the one from `chai` provided through `cds.test()`, as shown in the previous sample.
You can use Mocha-style `before/after` or Jest-style `beforeAll/afterAll` in your tests, as well as the common `describe, test, it` methods.
::: tip
[All tests in cap/samples](https://github.com/sap-samples/cloud-cap-samples/blob/master/test) are written in that portable way. <br>
Run them with `npm run jest` or with `npm run mocha`.
:::



##### Using Watchers {.h3}

You can also start the tests in watch mode, for example:

```sh
jest --watchAll
```

which should give you green tests, when running in cap/samples root:

<pre class="log">
<em>PASS</em>  <i>test/</i>cds.ql.test.js
<em>PASS</em>  <i>test/</i>hierarchical-data.test.js
<em>PASS</em>  <i>test/</i>hello-world.test.js
<em>PASS</em>  <i>test/</i>messaging.test.js
<em>PASS</em>  <i>test/</i>consuming-services.test.js
<em>PASS</em>  <i>test/</i>custom-handlers.test.js
<em>PASS</em>  <i>test/</i>odata.test.js
<em>PASS</em>  <i>test/</i>localized-data.test.js

Test Suites: <em>8 passed</em>, 8 total
Tests:       <em>65 passed</em>, 65 total
Snapshots:   0 total
Time:        3.611 s, estimated 4 s
<i>Ran all test suites.</i>
</pre>

Similarly, you can use other test watchers like `mocha -w`.



## Using `cds.test` in REPL

You can use `cds.test` in REPL, for example, by running this from your command line:

```sh
[samples](https://github.com/sap-samples/cloud-cap-samples) cds repl
Welcome to cds repl v5.5.0
```
```js
> cds.test('@capire/bookshop')
Test {}
```
```sh
[cds](cds) - model loaded from 6 file(s):

  ./bookshop/db/schema.cds
  ./bookshop/srv/admin-service.cds
  ./bookshop/srv/cat-service.cds
  ./bookshop/app/services.cds
  ./../../cds/common.cds
  ./common/index.cds

[cds](cds) - connect to db > sqlite { database: ':memory:' }
 > filling sap.capire.bookshop.Authors from ./bookshop/db/data/sap.capire.bookshop-Authors.csv
 > filling sap.capire.bookshop.Books from ./bookshop/db/data/sap.capire.bookshop-Books.csv
 > filling sap.capire.bookshop.Books.texts from ./bookshop/db/data/sap.capire.bookshop-Books_texts.csv
 > filling sap.capire.bookshop.Genres from ./bookshop/db/data/sap.capire.bookshop-Genres.csv
 > filling sap.common.Currencies from ./common/data/sap.common-Currencies.csv
 > filling sap.common.Currencies.texts from ./common/data/sap.common-Currencies_texts.csv
/> successfully deployed to sqlite in-memory db

[cds](cds) - serving AdminService { at: '/admin', impl: './bookshop/srv/admin-service.js' }
[cds](cds) - serving CatalogService { at: '/browse', impl: './bookshop/srv/cat-service.js' }

[cds](cds) - server listening on { url: 'http://localhost:64914' }
[cds](cds) - launched at 9/8/2021, 5:36:20 PM, in: 767.042ms
[ terminate with ^C ]
```
```js
> await SELECT `title` .from `Books` .where `exists author[name like '%Poe%']`
[ { title: 'The Raven' }, { title: 'Eleonora' } ]
```
```js
> var { CatalogService } = cds.services
> await CatalogService.read `title, author` .from `ListOfBooks`
[
  { title: 'Wuthering Heights', author: 'Emily Brontë' },
  { title: 'Jane Eyre', author: 'Charlotte Brontë' },
  { title: 'The Raven', author: 'Edgar Allen Poe' },
  { title: 'Eleonora', author: 'Edgar Allen Poe' },
  { title: 'Catweazle', author: 'Richard Carpenter' }
]
```

## Providing Test Data

Data can be supplied:
- Programmatically as part of the test code
- In CSV files from `db/data` folders

<span id="intestdata" />

This following example shows how data can be inserted into the database using regular [CDS service APIs](services#srv-run) (using [CQL INSERT](cds-ql#INSERT) under the hood):

```js
beforeAll(async () => {
  const db = await cds.connect.to('db')  // [!code focus]
  const {Books} = db.model.entities('my.bookshop') // [!code focus]
  await db.create(Books).entries([ // [!code focus]
    {ID:401, title: 'Book 1'}, // [!code focus]
    {ID:402, title: 'Book 2'} // [!code focus]
  ])
  // verify new data through API
  const { data } = await GET `/catalog/Books`
  expect(data.value).to.containSubset([{ID: 401}, {ID: 402}])
})
```

This example also demonstrates the difference of accessing the database or the service layer: inserting data through the latter would fail because `CatalogService.Books` is read-only. In contrast, accessing the database as part of such test fixture code is fine. Just keep in mind that the data is not validated through your custom handler code, and that the database layer, that is, the table layout, is no API for users.

##### Data Reset {.h3}

Using the [cds.test.data](#data) API, you can have all data deleted and redeployed before each test:

```js
const { GET, expect, data } = cds.test ('@capire/bookshop')
data.autoReset(true) // delete + redeploy from CSV before each test
```

or reset it whenever needed:

```js
await data.reset()
```

or only delete it:

```js
await data.delete()
```

## `cds.test` Reference { #cds-test}

### `cds.test (projectDir)` → `Test` { #run}

Launches a CDS server with an arbitrary port and returns a subclass which also acts as an [Axios]( https://github.com/axios/axios) lookalike, providing methods to send requests.
Launch a server in the given project folder, using a default command of `cds serve --in-memory?`.

The server is shut down after all tests have been executed.

### `cds.test (command, ...args)` → `Test` { #run-2}

Launch a server with the given command and arguments.<br>
Example: `cds.test ('serve', '--in-memory', '--project', <dir>)`

### class `Test`

Instances of this class are returned by `cds.test()`. See below for its functions and properties.


#### `.GET/PATCH/POST/PUT/DELETE (url, ...)` ⇢ [`response`](https://github.com/axios/axios#response-schema) { #get}

Aliases for corresponding [`get/patch/...` methods from Axios](https://github.com/axios/axios#instance-methods). For calls w/o additional parameters, a simplified call style is available where the `()` can be omitted. For example, <pre>GET `/foo`</pre>  and <code>GET(`/foo`)</code> are equivalent. {.indent}

#### `.expect` → [`expect`](https://www.chaijs.com/api/bdd/) { #expect}

Provides the [expect](https://www.chaijs.com/api/bdd/) function from the [chai](#chai) assertion library. {.indent}

#### `.chai` → [`chai`](https://www.chaijs.com/api/) { #chai}

Provides the [chai](https://www.chaijs.com/) assertion library.
It is preconfigured with the [chai-subset](https://www.chaijs.com/plugins/chai-subset/) and [chai-as-promised](https://www.chaijs.com/plugins/chai-as-promised/) plugins. These plugins contribute the `containSubset` and `eventually` APIs, respectively. {.indent}

#### `.axios` → [`axios`](https://github.com/axios/axios#axios-api) { #axios}

Provides the [Axios](https://github.com/axios/axios) instance that is used as HTTP client.
It comes preconfigured with the base URL of the running server, that is, `http://localhost:...`.  This way, you only need to specify host-relative URLs in tests, like `/catalog/Books`. {.indent}

#### `.data` → `{ }` { #data}

Provides utilities to manage test data: {.indent}
- `.autoReset (boolean)` enables automatic deletion and redeployment of CSV data before each test. Default is `false`.
- `.delete ()` deletes data in all database tables
- `.reset ()` deletes data in all database tables and deploys CSV data again {.indent}

#### `.in (...paths)` → `Test` { #in}

Sets the given path segments as project root.<br>
Example: `cds.test.in(__dirname, '..').run('serve', '--in-memory')` {.indent}


#### `.verbose (boolean)` → `Test` { #verbose}

Sets verbose mode, so that, for example, server logs are shown. {.indent}


## Best Practices { #best-practices}

### Check Response Data Instead of Status Codes {.h3}

Avoid checking for single status codes. Instead simply check the response data:

```js
const { data, status } = await GET `/catalog/Books`
expect(status).to.equal(200)   // <-- DON'T
expect(data.value).to.containSubset([{ID: 1}])  // just do this
```

This makes a difference in case of an error: with the status code check, your test will abort with a useless _Expected: 200, received: xxx_ error, while without it, it fails with a richer error that includes a status text.

Note that by default, Axios yields errors for status codes `< 200` and `>= 300`. This can be [configured](https://github.com/axios/axios#handling-errors), though.

### Be Relaxed When Checking Error Messages {.h3}

When expecting errors, compare their text in a relaxed fashion. Don't hard-wire the exact error text, as this might change over time, breaking your test unnecessarily.

```js
await expect(POST(`/catalog/Books`,{ID:333})).to.be.rejectedWith(
  'Entity "CatalogService.Books" is read-only')  // DON'T hard-wire entire texts
await expect(POST(`/catalog/Books`,{ID:333})).to.be.rejectedWith(
  /read?only/i)  // better: check for the essential information, use regexes
```
