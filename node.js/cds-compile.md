---
shorty: cds.compile
synopsis: >
  Use `cds.compile`, or one of the convenience shortcuts `cds.parse` and `cds.load` to parse and compile CDS models programmatically.
redirect_from:
  - cds/js-api
layout: node-js
status: released
uacp: This page is linked from the Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/855e00bd559742a3b8276fbed4af1008.html
---


# Parsing and Compiling Models


{{$frontmatter.synopsis}}


<!-- {% include links-for-node.md %}
{% include _toc levels="2,3" %} -->


## <span style="color:#800; font-weight:500">cds</span>.compile <i> (models, options) </i>  {: #cds-compile}

This is the central function and API facade to parse and compile models.
It supports different variants based on the type of the `models` argument as outlined in the following subsections.


### <i>async</i> <span style="color:#800; font-weight:500">cds</span>.compile <i> ('file:...', options) <span style="font-style:normal">&#8674;</span> [csn](../cds/csn) </i> {: #file .first-of-many}
### <i>async</i> <span style="color:#800; font-weight:500">cds</span>.compile <i> ([files], options) <span style="font-style:normal">&#8674;</span> [csn](../cds/csn) </i> {: #files}

If the first argument is either a string starting with `"file:"`, or an _array_ of filenames, these files are read and compiled to a single CSN asynchronously.

Examples:

```js
let csn = await cds.compile ('file:db')
let csn = await cds.compile (['db','srv','app'])
```

The given filenames are [resolved to effective absolute filenames using `cds.resolve`](#cds-resolve).


### <span style="color:#800; font-weight:500">cds</span>.compile <i> ('[cdl](../cds/cdl)', options) <span style="font-style:normal">&#8594;</span> </i> [csn](../cds/csn) {: #cdl}

If a single CDL string is passed as first argument, that CDL source is compiled to CSN synchroneously.
Note: `using from` clauses are not resolved in this usage.

Example:

```cds
let csn = cds.compile (`
  using {cuid} from '@sap/cds/common';
  entity Foo : cuid { foo:String }
  entity Bar as projection on Foo;
  extend Foo with { bar:String }
`)
```



### <span style="color:#800; font-weight:500">cds</span>.compile <i> ({sources}, options) <span style="font-style:normal">&#8594;</span> [csn](../cds/csn) </i> {: #sources}

Allows to synchronously compile multiple named CDL or CSN sources, which allows to also resolve `using from` clauses.

Example:

<!-- cds-mode: ignore, because it's a JS example with inline CDS snippets -->
```cds
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


### <em> Options </em>

All variants of `cds.compile()` support the following `options`:
<!-- {% assign o = '<span style="font-weight:400">options</span>' %} -->

#### <span style="font-weight:400">options</span>.flavor {:#csn-flavors}

<div class='indent' markdown='1'>
One of:
  - `'parsed'` &rarr; generates a parsed-only CSN
<!--  - `'xtended'` &rarr; includes and extensions applied -->
  - `'inferred'` &rarr; + all query signatures inferred
</div>

#### <span style="font-weight:400">options</span>.min

<div class='indent' markdown='1'>
If `true`, definitions not reachable from service roots will be deleted.
Use `cds.env.features.skip_unused` to control how the respective tree shaking mechanism works:
  - `false` &rarr; switched off
  - `true` &rarr; remove only definitions annotated with `@cds.persistence.skip:'if-unused'`
  - `'all'` &rarr; remove all definitions not reachable from services
</div>

#### <span style="font-weight:400">options</span>.docs

If `true`, doc comments (`/**...*/`) are preserves in generated CSN {:.indent}

#### <span style="font-weight:400">options</span>.locations

If `true`, all `$location` properties are preserved in generated CSN {:.indent}

#### <span style="font-weight:400">options</span>.messages

Pass an empty array to collect all compiler messages in it. {:.indent}



## <span style="color:#800; font-weight:500">cds</span>.compile.for/to<i> ... </i>

These are collection of model processors take a CDS model as input and generate different outputs.
<!-- {% assign for = '<i>&nbsp;&#8627;&nbsp;.for<span style="font-weight:500; color:darkred">' %}
{% assign to = '<i>&nbsp;&#8627;&nbsp;.to<span style="font-weight:500; color:darkred">' %} -->


### <em> Static and Fluent API Variants </em>

All methods are available in a static and fluent variants.

Static variants are invoked like that::

```js
let odata = cds.compile.for.odata(csn)
let yaml = cds.compile.to.yml(csn)
```

Fluent API variants are invoked like that:

```js
let odata = cds.compile(model).for.odata()
let yaml = cds.compile(model).to.yaml()
```

While static variants expect a parsed CSN, fluent variants also accept all of the source inputs [as documented for `cds.compile`](#cds-compile) above.



### <i>&nbsp;&#8627;&nbsp;.for<span style="font-weight:500; color:darkred">.odata ([csn](../cds/csn), options) <span style="font-style:normal">&#8594;</span> unfolded [csn](../cds/csn) </span> </i> {:#for-odata }

<div class='indent' markdown='1'>

Returns a new csn with unfolded structs and associations, depending on the specified `options`.
In addition resolves certain [common annotations](../cds/annotations) to their [OData vocabulary](../advanced/odata#vocabularies) counterparts.

Accepted `options` are those documented in the [OData guide](../advanced/odata#api-flavors) without `cds.odata.` prefix.
If the `options` argument is a single string, it is interpreted as a shortcut to `{flavor:...}`

Examples:
```js
let o1 = cds.compile(csn).for.odata ({
  containment:true,
  version:'v4',
})
let o2 = cds.compile(csn).for.odata ({flavor:'x4'})
let o3 = cds.compile(csn).for.odata ('x4') //> shortcut to above
```

**Idempotent behavoir** &mdash; Calling this function again on the same csn input will return the cached unfolded csn output from the former call.
</div>


### <i>&nbsp;&#8627;&nbsp;.to<span style="font-weight:500; color:darkred">.json/yaml ([csn](../cds/csn)) <span style="font-style:normal">&#8594;</span> [json](http://json.org) </span> </i> {:#to-json }
Renders the given model to a formatted JSON  or YAML string. {:.indent}


### <i>&nbsp;&#8627;&nbsp;.to<span style="font-weight:500; color:darkred">.edm/edmx ([csn](../cds/csn), options) <span style="font-style:normal">&#8594;</span> [edm](http://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part3-csdl.html) </span> </i> {:#to-edmx }

<div class='indent' markdown='1'>

Compiles and returns an OData v4 [EDM](http://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part3-csdl.html), repectively [EDMX](http://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part3-csdl.html) model object for the passed in model, which is expected to contain at least one service definition.

Accepted `options` the same [as documented for `cds.compile.for.odata`](#for-odata) above, with one addition: If the model contains more than one service definition, use `{service:...}` option parameter to:

* Either choose exactly one, for example, `{service:'Catalog'}`
* Choose to return EDM objects for all, that means, `{service:'all'}`

In case of the latter, a generator is returned that yields `[ edm, {name} ]` for each service.
For example, use it as follows:

```js
// for one service
let edm = cds.compile(csn).to.edm ({service:'Catalog'})
console.log (edm)
```
```js
// for all services
let all = cds.compile(csn).to.edm ({service:'all'})
for (let [edm,{name}] of all)  console.log (name,edm)
```
</div>



### <i>&nbsp;&#8627;&nbsp;.to<span style="font-weight:500; color:darkred">.hdbtable ([csn](../cds/csn)) <span style="font-style:normal">&#8594;</span> ... </span> </i> {:#to-hsb .first-of-many }

### <i>&nbsp;&#8627;&nbsp;.to<span style="font-weight:500; color:darkred">.hdbcds ([csn](../cds/csn)) <span style="font-style:normal">&#8594;</span> ... </span> </i>

<div class='indent' markdown='1'>

Generates `hdbtable/view` or `hdbcds` output.
Returns a generator that yields `[ src, {file} ]` for each resulting `.hdbtable`, `.hdbview`, or `.hdbcds` file.
For example, use it as follows:

```js
let all = cds.compile.to.hdbtable (csn)
for (let [src,{file}] of all)
  console.log (file,src)
```
</div>





### <i>&nbsp;&#8627;&nbsp;.to<span style="font-weight:500; color:darkred">.sql ([csn](../cds/csn), options) <span style="font-style:normal">&#8594;</span> [SQL](https://wikipedia.org/wiki/SQL) DDL </span> </i> {:#to-sql }

<div class='indent' markdown='1'>

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
</div>




### <i>&nbsp;&#8627;&nbsp;.to<span style="font-weight:500; color:darkred">.cdl ([csn](../cds/csn)) <span style="font-style:normal">&#8594;</span> [CDL](../cds/cdl.md) </span> </i> {:#to-cdl  .impl.concept}

Reconstructs [CDL](../cds/cdl.md) source code for the given csn model. {:.indent}


### <i>&nbsp;&#8627;&nbsp;.to<span style="font-weight:500; color:darkred">.asyncapi (file) -> [document] </span> </i> {: #to-asyncapi }

<div class='indent' markdown='1'>

Convert the CSN file into an AsyncAPI document:

```js
const doc = cds.compile.to.asyncapi(csn_file)
```

</div>


## <span style="color:#800; font-weight:500">cds</span>.parse <i> ([cdl](../cds/cdl)) <span style="font-style:normal">&#8594;</span> [csn](../cds/csn) </i> {: #cds-parse}

This is an API facade for a set of functions to parse whole [CDL] models, individual [CQL](../cds/cql) queries, or CQL expressions.
The three main methods are offered as classic functions, as well as [tagged template string functions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Template_literals).
The individual methods are:
<!-- index is inserted here automatically -->


<!-- {% assign parse_ = '<span style="color:grey">cds.parse</span>' %} -->


### `CDL`, <span style="color:grey">cds.parse</span>.cdl <i> ([cdl](../cds/cdl)) <span style="font-style:normal">&#8594;</span> [csn](../cds/csn) </i> {:#parse-cdl}

Parses a source string in _[CDL][../cds/cdl]_ syntax and returns it as a parsed model according to the [_CSN spec_](../cds/csn).
It's essentially a [shortcut to `cds.compile (..., {flavor:'parsed'})`](#cds-compile).

Examples:
```js
let csn = CDL`entity Foo{}`
let csn = cds.parse (`entity Foo{}`)  //= shortcut to:
let csn = cds.parse.cdl (`entity Foo{}`)
```



### `CQL`, <span style="color:grey">cds.parse</span>.cql <i> ([cql](../cds/cql.md)) <span style="font-style:normal">&#8594;</span> [cqn](../cds/cqn) </i> {:#parse-cql}

Parses a source string in _[CQL](../cds/cql)_ syntax and returns it as a parsed query according to the [_CQN spec_][..cds/cqn].

Examples:
```js
let cqn = CQL`SELECT * from Foo`
let cqn = cds.parse.cql (`SELECT * from Foo`)
```


### `CXL`, <span style="color:grey">cds.parse</span>.expr <i> (cxl) <span style="font-style:normal">&#8594;</span> [cxn](../cds/cxn) </i> {:#parse-cxl}

Parses a source string in CQL expression syntax and returns it as a parsed expression according to the [_CQN Expressions spec_](../cds/cxn#operators).

Examples:
```js
let cxn = CXL`foo.bar > 9`
let cxn = cds.parse.expr (`foo.bar > 9`)
//> {xpr:[ {ref:['foo', 'bar']}, '>', {val:9} ] }
```


### <span style="color:grey">cds.parse</span>.xpr <i> (cxl) <span style="font-style:normal">&#8594;</span> [xpr](../cds/cxn#operators) </i>

Convenience shortcut to `cds.parse.expr(x).xpr`

Example:
```js
let xpr = cds.parse.xpr (`foo.bar > 9`)
//> [ {ref:['foo', 'bar']}, '>', {val:9} ]
```


### <span style="color:grey">cds.parse</span>.ref <i> (cxl) <span style="font-style:normal">&#8594;</span> [ref](../cds/cxn#references) </i>

Convenience shortcut to `cds.parse.expr(x).ref`

Example:
```js
let ref = cds.parse.ref (`foo.bar`)
//>= ['foo', 'bar']
```





## <span style="color:#800; font-weight:500">cds</span>.load <i> (files) <span style="font-style:normal">&#8674;</span> [csn](../cds/csn) </i> {:#cds-load}

Loads and parses a model from one or more files into a single effective model.
It's essentially a [shortcut to `cds.compile (..., {flavor:'inferred'})`](#cds-compile).

##### Arguments:

* `files` &mdash; a single filename, or an array of such, [resolved using `cds.resolve()`](#cds-resolve)
* `options` &mdash; options passed to [`cds.compile()`](#cds-compile)

> Note: It’s recommended to omit file suffixes to leverage automatic loading from precompiled _[CSN](../cds/csn)_ files instead of _[CDL](../cds/cdl.md)_ sources.


##### Usages:

```js
// load a model from a single source
const csn = await cds.load('my-model')
```
```js
// load a a model from several sources
const csn = await cds.load(['db','srv'])
```
```js
// load relative to current working directory
cds.load('relative-to-cwd')
cds.load('./relative-to-cwd')
// load relative to current node module
cds.load(__dirname+'/relative-to-this-module')
```



## <span style="color:#800; font-weight:500">cds</span>.resolve <i> (paths) <span style="font-style:normal">&#8594;</span> [filenames] </i> {:#cds-resolve }

Resolves the given source paths by fetching matching model source files, that is _.cds_ or _.csn_ files, including models for required services.
In detail it works as follows:

1. If `paths` is `'*'`: `paths` = [ ...`cds.env.roots`, ...`cds.requires.<srv>.model` ]
2. If `paths` is a single string: `paths` = [ `paths` ]
3. For `<each>` in `paths`: ...
- if _\<each>.csn|cds_ exists &rarr; use it
- if _\<each>/index.csn|cds_ exists &rarr; use it
- if _\<each>_ is a folder &rarr; use all _.csn|cds_ found in there

[Learn more about `cds.env`](cds-env){:.learn-more}

In effect it resolves and returns an array with the absolute filenames of the root cds model files to be used to invoke the compiler.

If no files are found, `undefined` is returned.

Examples:

```js
cds.env.folders           // = folders db, srv, app by default
cds.env.roots             // + schema and services in cwd
cds.resolve('*',false)    // + models in cds.env.requires
cds.resolve('*')          // > the resolved existing files
cds.resolve('db'])        // > the resolved existing files
cds.resolve(['db','srv']) // > the resolved existing files
cds.resolve('none')       // > undefined
```
> Try this in cds repl launched from your project root to see that in action.
