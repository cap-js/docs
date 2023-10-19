---
status: released
---



# The *cds* Façade Object {#title}



The `cds` facade object provides access to all CAP Node.js APIs. Use it like that:

```js
const cds = require('@sap/cds')
let csn = cds.compile(`entity Foo {}`)
```

::: tip Use `cds repl` to try out things
For example, like this to get the compiled CSN for an entity `Foo`:
```js
[dev] cds repl
Welcome to cds repl v 7.3.0
> cds.compile(`entity Foo { key ID : UUID }`)
{ definitions: {
  Foo: { kind: 'entity', elements: { ID: { key: true, type: 'cds.UUID' } } }
}}
```
:::



## Refs to Submodules

Many properties of cds are references to submodules, which are lazy-loaded on first access to minimize bootstrapping time and memory consumption. The submodules are documented in separate documents.

- [cds. model](cds-facade#cds-model) {.property}
  - [cds. resolve()](cds-compile#cds-resolve) {.method}
  - [cds. load()](cds-compile#cds-load) {.method}
  - [cds. parse()](cds-compile#cds-parse) {.method}
  - [cds. compile](cds-compile) {.method}
  - [cds. linked()](cds-reflect) {.method}
- [cds. server](cds-server) {.property}
- [cds. serve()](cds-serve) {.method}
  - cds. services {.property}
  - cds. middlewares {.property}
  - cds. protocols {.property}
  - cds. auth {.property}
- [cds. connect](cds-connect) {.property}
- [cds. ql](cds-ql) {.property}
- [cds. tx()](cds-tx) {.method}
- [cds. log()](cds-log) {.method}
- [cds. env](cds-env) {.property}
- [cds. auth](authentication) {.property}
- [cds. i18n](cds-i18n) {.property}
- [cds. test](cds-test) {.property}
- [cds. utils](cds-utils) {.property}



## Builtin Types & Classes

Following properties provide access to the classes and prototypes of [linked CSNs](cds-reflect).

### [cds. builtin .types](cds-reflect#cds-builtin-types) {.property}
### [cds. builtin .classes](cds-reflect#cds-builtin-classes) {.property}

  - [cds. Association](cds-reflect#cds-association) {.property}
  - [cds. Composition](cds-reflect#cds-builtin-classes) {.property}
  - [cds. entity](cds-reflect#cds-entity) {.property}
  - [cds. event](cds-reflect#cds-event) {.property}
  - [cds. type](cds-reflect#cds-type) {.property}
  - [cds. array](cds-reflect#cds-builtin-classes) {.property}
  - [cds. struct](cds-reflect#cds-struct) {.property}
  - [cds. service](cds-reflect#cds-struct) {.property}



## Core Classes

### [cds. Service](core-services#core-services) {.class}

- [cds. ApplicationService](app-services) {.class}
- [cds. RemoteService](remote-services) {.class}
- [cds. MessagingService](messaging) {.class}
- [cds. DatabaseService](databases) {.class}
- [cds. SQLService](databases) {.class}

### [cds. EventContext](events#cds-event-context) {.class}
### [cds. Event](events#cds-event) {.class}
### [cds. Request](events#cds-request) {.class}
### [cds. User](authentication#cds-user) {.class}




## Properties

Following are properties which are not references to submodules.



### cds. version {.property}

Returns the version of the `@sap/cds` package from which the current instance of the `cds` facade module was loaded. For example, use that to write version specific code:

```js
const [major, minor] = cds.version.split('.').map(Number)
if (major < 6) // code for pre cds6 usage
```




### cds. home {.property}

Returns the pathname of the `@sap/cds` installation folder from which the current instance of the `cds` facade module was loaded.

```log
[dev] cds repl
> cds.home // [!code focus]
~/.npm/lib/node_modules/@sap/cds
```



### cds. root {.property}

Returns the project root that is used by all CAP runtime file access as the root directory.
By default this is `process.cwd()`, but can be set to a different root folder.
It's guaranteed to be an absolute folder name.

```js
// Print current project's package name
let package_json = path.join (cds.root,'package.json') // [!code focus]
let { name, description } = require(package_json)
console.log ({ name, description })
```



### cds. cli {.property}

Provides access to the parsed effective `cds` cli command and arguments. Example: If you would add log respective output in a project-local `server.js`, and start your server with `cds watch`, you'd see an output like this:

```js
Trace : {
  command: 'serve',
  argv: [ 'all' ],
  options: {
    'with-mocks': true,
    'in-memory?': true
  }
}
```

For example, [`cds-plugins`](cds-serve) can use that to plugin to different parts of the framework for different commands being executed.




### cds. env {.property}

Provides access to the effective configuration of the current process, transparently from various sources, including the local _package.json_ or _.cdsrc.json_, service bindings and process environments.

```console
[dev] cds repl
> cds.env.requires.auth // [!code focus]
{
  kind: 'basic-auth',
  strategy: 'mock',
  users: {
    alice: { tenant: 't1', roles: [ 'cds.Subscriber', 'admin' ] },
    bob: { tenant: 't1', roles: [ 'cds.ExtensionDeveloper' ] },
    # ...,
    '*': true
  },
  tenants: {
    t1: { features: [ 'isbn' ] },
    t2: { features: '*' }
  }
}
```

[Learn more about `cds.env`](cds-env){.learn-more}



### cds. requires {.property}

... is a convenience shortcut to [`cds.env.requires`](#cds-env).

```console
[dev] cds repl
> cds.requires.auth // [!code focus]
{
  kind: 'basic-auth',
  # ... as above
}
```



### cds. services {.property}

A dictionary and cache of all instances of [`cds.Service`](core-services) constructed through [`cds.serve()`](cds-serve),
or connected to by [`cds.connect()`](cds-connect).

It's an *iterable* object, so can be accessed in the following ways:

```js
let { CatalogService, db } = cds.services
let all_services = [ ... cds.services ]
for (let k in cds.services) //... k is a services's name
for (let s of cds.services) //... s is an instance of cds.Service
```



### cds. context {.property}

Provides access to common event context properties like `tenant`, `user`, `locale` as well as the current root transaction for automatically managed transactions.

[Learn more about that in reference docs for `cds.tx`.](./cds-tx){.learn-more}



### cds. model {.property}

The effective [CDS model](../cds/csn) loaded during bootstrapping, which contains all service and entity definitions, including required services. Many framework operations use that as a default where models are required. It is loaded in built-in `server.js` like so:

```js
cds.model = await cds.load('*')
```

[Learn more about bootstrapping in `cds.server`.](./cds-serve){.learn-more}




### cds. app {.property}

The [express.js Application object](https://expressjs.com/de/4x/api.html#app) constructed during bootstrapping. Several framework operations use that to add express handlers or middlewares. It is initialised in built-in `server.js` like so:

```js
cds.app = require('express')()
```

[Learn more about bootstrapping in `cds.server`.](./cds-serve){.learn-more}




### cds. db {.property}

A shortcut to [`cds.services.db`](#cds-services), the primary database connected to during bootstrapping. Many framework operations use that to address and interact with the primary database. In particular that applies to the global [`cds.ql`](cds-ql) statement objects. For example:

```js
let books = await SELECT.from(Books) // is a shortcut for:
let books = await cds.db.run ( SELECT.from(Books) )
```

It is initialized in built-in `server.js` like so:

```js
cds.db = await cds.connect.to('db')
```

[Learn more about bootstrapping in `cds.server`.](./cds-serve){.learn-more}



## Methods



### cds. error() {.method}

```ts
function cds.error (
  message  : string | object,
  details? : object
  caller?  : function
)
```

This is a helper to construct new errors in various ways:

```js
let e = new cds.error ('message')
let e = new cds.error ('message', { code, ... })
let e = new cds.error ({ message, code, ... })
```

If called without `new`  the error is thrown immediately allowing code like that:

```js
let e = foo || cds.error (`Expected 'foo' to be truthy, but got: ${foo}`)
```

You can also use `cds.error` with tagged template strings:

```js
let e = foo || cds.error `Expected 'foo' to be truthy, but got: ${foo}`
```

> In contrast to basic template strings, passed in objects are added using Node's  `util.format()` instead of `toString()`.

Method `cds.error.expected` allows to conveniently construct error messages as above:

```js
let e = foo || cds.error.expected `${{foo}} to be truthy`
```

Optional argument `caller` can be a calling function to truncate the error stack. Default is `cds.error` itself, so it will never show up in the stacks.





### cds. exit() {.method}

Provides a graceful shutdown for running servers, by first emitting `cds.emit('shutdown')` with handlers allowed to be `async` functions. If not running in a server, it calls `process.exit()`

```js
cds.on('shutdown', async()=> fs.promises.rm('some-file.json'))
cds.on('shutdown', ()=> console.log('shutdown'))
cds.exit() //> will rune above handlers before stopping the server
```





## Lifecycle Events

[Learn more about Lifecycle Events in `cds.server`](cds-server#lifecycle-events){.learn-more}

#### cds. once '*bootstrap*' {.event}

#### cds. on '*loaded*' {.event}

#### cds. on '*connect*' {.event}

#### cds. on '*serving*' {.event}

#### cds. once '*served*' {.event}

#### cds. once '*listening*' {.event}

#### cds. once '*shutdown*' {.event}
