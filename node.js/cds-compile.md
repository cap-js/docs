---
redirect_from:
  - cds/js-api
status: released
uacp: This page is linked from the Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/855e00bd559742a3b8276fbed4af1008.html
---


# Parsing and Compiling Models



[[toc]]




## cds. compile (...) {.method}

```tsx
function cds.compile (
  model :
  	'*', 'file:<filename>' | filenames[] |  // source files
    CDL string | { CDL strings }           // sources in memory
  ,
  options : CSN_flavor | {
    flavor?    : CSN_flavor,
    min?       : boolean,
    docs?      : boolean,
    locations? : boolean,
    messages?  : []
  }
)
type CSN_flavor = 'parsed' | 'inferred'
```



This is the central function to compile models from files or in-memory sources to [CSN](../cds/csn).
It supports different variants based on the type of the first argument `model` as outlined below.

Depending on the variants, the method returns a Promise or a sync value.



### Compiling `.cds` files (async)

If the first argument is either a string starting with `"file:"`, or an _array_ of filenames, these files are read and compiled to a single CSN asynchronously:

```js
let csn = await cds.compile (['db','srv','app'])
let csn = await cds.compile ('*')
let csn = await cds.compile ('file:db')
```

> The given filenames are resolved to effective absolute filenames using [`cds.resolve`](#cds-resolve).



### Single in-memory sources

If a single string, not starting with `file:`  is passed as first argument, it is interpreted as a CDL source string and compiled to CSN synchronously:

```js
let csn = cds.compile (`
  using {cuid} from '@sap/cds/common';
  entity Foo : cuid { foo:String }
  entity Bar as projection on Foo;
  extend Foo with { bar:String }
`)
```

> Note: `using from` clauses are not resolved in this usage.



### Multiple in-memory sources

Finally, you can pass an object with multiple named CDL or CSN sources, which allows to also resolve `using from` clauses:

```js
let csn = cds.compile ({
  'db/schema.cds': `
    using {cuid} from '@sap/cds/common';
    entity Foo : cuid { foo:String }
  `,
  'srv/services.cds': `
    using {Foo} from '../db/schema';
    entity Bar as projection on Foo;
    extend Foo with { bar:String }
  `,
  '@sap/cds/common.csn': `
    {"definitions":{
      "cuid": { "kind": "aspect", "elements": {
        "ID": { "key":true, "type": "cds.UUID" }
      }}
    }}
  `,
})
```





### Additional Options

You can pass additional options like so:

```js
let csn = await cds.compile('*',{ min:true, docs:true })
```



| Option      | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| `flavor`    | By default the returned CSN is in `'inferred'` flavor, which is an effective model, with all aspects, includes, extensions and redirects applied and all views and projections inferred. Specify `'parsed'` to only have single models parsed. |
| `min`       | Specify `true` to have [`cds.minify)`](#cds-minify) applied after compiling the models. |
| `docs`      | Specify `true` to have the all `/** ... */` doc comments captured in the CSN. |
| `locations` | Specify `true` to have the all `$location` properties preserved in serialized CSN. |
| `messages`  | Pass an empty array to get all compiler messages collected in there. |




## cds. compile .to ... {.property}

Following are a collection of model processors which take a CSN as input and compile it to a target output. They can be used in two API flavors:

```js
let sql = cds.compile(csn).to.sql ({dialect:'sqlite'}) //> fluent
let sql = cds.compile.to.sql (csn,{dialect:'sqlite'}) //> direct
```


### .json() {.method}

```tsx
function cds.compile.to.json ( options: {
  indents : integer
})
```

Renders the given model to a formatted JSON string.

Option `indents` is the indent as passed to `JSON.stringify`.





### .yaml() {.method}

Renders the given model to a formatted JSON  or YAML string.



### .edm() {.method}

### .edmx() {.method}


Compiles and returns an OData v4 [EDM](https://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part3-csdl.html), respectively [EDMX](https://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part3-csdl.html) model object for the passed in model, which is expected to contain at least one service definition.

Accepted `options` the same [as documented for `cds.compile.for.odata`](#for-odata) above, with one addition: If the model contains more than one service definition, use `{service:...}` option parameter to:

* Either choose exactly one, for example, `{service:'Catalog'}`
* Choose to return EDM objects for all, that means, `{service:'all'}`

In case of the latter, a generator is returned that yields `[ edm, {file, suffix} ]` for each service.
For example, use it as follows:

```js
// for one service
let edm = cds.compile.to.edm (csn, {service:'Catalog'})
console.log (edm)
```
```js
// for all services
let all = cds.compile.to.edm (csn, {service:'all'})
for (let [edm,{file,suffix}] of all)  console.log (file,suffix,edm)
```




### .hdbtable() {.method}

### .hdbcds() {.method}


Generates `hdbtable/view` or `hdbcds` output.
Returns a generator that yields `[ src, {file} ]` for each resulting `.hdbtable`, `.hdbview`, or `.hdbcds` file.
For example, use it as follows:

```js
let all = cds.compile.to.hdbtable (csn)
for (let [src,{file}] of all)
  console.log (file,src)
```



### .sql() {.method}


Generates SQL DDL statements for the given model.
The default returns an array with the generated statements.

Accepted `options` are:

- `dialect`: _'plain' \| 'sqlite' \| 'postgres' \| 'h2'_ &rarr; chooses the dialect to generate
- `names`: _'plain' \| 'quoted'_ &rarr; allows to generate DDL using quoted names
- `as`: _'str'_ &rarr; returns a string with concatenated DDL statements.

Examples:
```js
let ddls1 = cds.compile(csn).to.sql()
let ddls2 = cds.compile(csn).to.sql({dialect:'plain'})
let script = cds.compile(csn).to.sql({as:'str'})
```



### .cdl() {.method}

Reconstructs [CDL](../cds/cdl.md) source code for the given csn model.



### .asyncapi() {.method}


Convert the CSN file into an AsyncAPI document:

```js
const doc = cds.compile.to.asyncapi(csn_file)
```







## cds. load (files) {.method #cds-load }

Loads and parses a model from one or more files into a single effective model.
It's essentially a [shortcut to `cds.compile ([...])`](#cds-compile). In addition emits event `cds 'loaded'`.

Declaration:

```tsx
function cds.load (
  files : filename || filenames[]
  options : {...} //> as in cds.compile
)
```

Usage examples:

```js
// load a model from a single source
const csn = await cds.load('my-model')
```

```js
// load a a model from several sources
const csn = await cds.load(['db','srv'])
```

> The given filenames are resolved using [`cds.resolve()`](#cds-resolve).
>
>  Note: It's recommended to omit file suffixes to leverage automatic loading from precompiled _[CSN](../cds/csn)_ files instead of _[CDL](../cds/cdl.md)_ sources.



## cds. parse() { .method }

This is an API facade for a set of functions to parse whole [CDL](../cds/cdl) models, individual [CQL](../cds/cql) queries, or CQL expressions.
The three main methods are offered as classic functions, as well as [tagged template string functions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Template_literals).



### `CDL`, cds. parse. cdl() {.method #parse-cdl }

Parses a source string in _[CDL](../cds/cdl)_ syntax and returns it as a parsed model according to the [_CSN spec_](../cds/csn).
It's essentially a [shortcut to `cds.compile (..., {flavor:'parsed'})`](#cds-compile).

Examples:
```js
let csn = CDL`entity Foo{}`
let csn = cds.parse (`entity Foo{}`)  //= shortcut to:
let csn = cds.parse.cdl (`entity Foo{}`)
```



### `CQL`, cds. parse. cql() {.method #parse-cql }

Parses a source string in _[CQL](../cds/cql)_ syntax and returns it as a parsed query according to the [_CQN spec_][..cds/cqn].

Examples:
```js
let cqn = CQL`SELECT * from Foo`
let cqn = cds.parse.cql (`SELECT * from Foo`)
```



### `CXL`, cds. parse. expr() {.method #parse-cxl }

Parses a source string in CQL expression syntax and returns it as a parsed expression according to the [_CQN Expressions spec_](../cds/cxn#operators).

Examples:
```js
let cxn = CXL`foo.bar > 9`
let cxn = cds.parse.expr (`foo.bar > 9`)
//> {xpr:[ {ref:['foo', 'bar']}, '>', {val:9} ] }
```



### cds. parse. xpr() {.method}

Convenience shortcut to `cds.parse.expr(x).xpr`

Example:
```js
let xpr = cds.parse.xpr (`foo.bar > 9`)
//> [ {ref:['foo', 'bar']}, '>', {val:9} ]
```



### cds. parse. ref() {.method}

Convenience shortcut to `cds.parse.expr(x).ref`

Example:
```js
let ref = cds.parse.ref (`foo.bar`)
//>= ['foo', 'bar']
```







## cds. minify() {.method}

Minifies a given CSN model by removing all unused<sup>1</sup> types and aspects, as well all entities tagged with `@cds.persistence.skip:'if-unused'`. Use it like that:

```js
let csn = await cds.load('*').then(cds.minify)
```

Using `cds.minify()` is particularly relevant, when reuse models are in the game. For example, this applies to [`@sap/cds/common`](../cds/common). In there, all code list entities like *Countries*, *Currencies* and *Languages* are tagged with `@cds.persistence.skip:'if-unused'`. For example, run this in *cap/samples/bookshop*:

```sh
[bookshop] DEBUG=minify cds -e "cds.load('*').then(cds.minify)"
```
... would generate this output, informing which definitions got skipped:
```sh
[minify] - skipping type Language
[minify] - skipping type Country
[minify] - skipping context sap.common
[minify] - skipping entity sap.common.Languages
[minify] - skipping entity sap.common.Countries
[minify] - skipping aspect cuid
[minify] - skipping aspect temporal
[minify] - skipping aspect extensible
[minify] - skipping entity sap.common.Languages.texts
[minify] - skipping entity sap.common.Countries.texts
```

<sup>1</sup> Unused in that context means, not reachable from roots services and — non-skipped — entities in the model.



## cds. resolve() {.method}

Resolves the given source paths by fetching matching model source files, that is _.cds_ or _.csn_ files, including models for required services.
In detail, it works as follows:

1. If `paths` is `'*'`: `paths` = [ ...`cds.env.roots`, ...`cds.requires.<srv>.model` ]
2. If `paths` is a single string: `paths` = [ `paths` ]
3. For `<each>` in `paths`: ...
- if _\<each>.csn|cds_ exists &rarr; use it
- if _\<each>/index.csn|cds_ exists &rarr; use it
- if _\<each>_ is a folder &rarr; use all _.csn|cds_ found in there

[Learn more about `cds.env`](cds-env){.learn-more}

In effect, it resolves and returns an array with the absolute filenames of the root cds model files to be used to invoke the compiler.

If no files are found, `undefined` is returned.

Examples:

```js
cds.env.folders           // = folders db, srv, app by default
cds.env.roots             // + schema and services in cwd
cds.resolve('*',false)    // + models in cds.env.requires
cds.resolve('*')          // > the resolved existing files
cds.resolve(['db'])       // > the resolved existing files
cds.resolve(['db','srv']) // > the resolved existing files
cds.resolve('none')       // > undefined
```
> Try this in cds repl launched from your project root to see that in action.
