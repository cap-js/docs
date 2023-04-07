---
shorty: <code>cds</code> Facade
layout: node-js
status: released
---


# The `cds` Facade Object {:#cds}

The `cds` facade object provides access to all Node.js APIs. It’s implemented as a global singleton, with lazy-loading of sub packages to minimize bootstrapping time and memory consumption.

```js
const cds = require('@sap/cds')
```

<!--- {% include links-for-node.md %} -->
<!--- {% include _toc levels="2,3" menu=".only" %} -->




### cds.lazified <i> (module | object) </i> {:#cds-lazified }


To minimize footprint, only the facade module itself is loaded by the import above, while close to all properties and functions provided are getters, which lazy-load respective modules only on demand. For example, you can see this in `cds repl`:

<pre class='log'>
[capire] cds repl
<em>Welcome to cds repl v4.1.6</em>
<b>></b> cds
cds {
  <i>... excerpt...</i>
  builtin: [Getter/Setter],
  resolve: [Getter/Setter],
  load: [Getter/Setter],
  parse: [Getter/Setter],
  compile: [Getter/Setter],
  connect: [Getter/Setter],
  serve: [Getter/Setter],
  server: [Getter/Setter],
  deploy: [Getter/Setter],
  version: '4.1.6',
  home: [Getter/Setter]
}
</pre>

> Still in repl, enter `cds.builtin`, and then `cds` again to see the effects of lazy-loading.


This is internally done using the `cds.lazified` methods, which turn selected properties of a given object or module into lazy getters.


#### cds.lazified <i> (module) &#8674; `require` </i>

Variant `cds.lazified(<module>)` takes a node module as an argument and returns a derived `require` function,
which turns all requires into lazy requires upon subsequent assignment to `module.exports`. For example:

```js
require = cds.lazified(module)
module.exports = {
  aStaticProperty : module.require('foo'),
  aLazyProperty : require('bar'),
}
```


#### cds.lazified  <i>  (object) &#8674; object </i>

Variant `cds.lazified(<object>)` turns all arrow functions with an argument named `lazy` into getters, as follows:
```js
const o = cds.lazified({
  aStaticProperty : require('foo'),
  aLazyProperty : lazy => require('bar'),
})
```
The lazy property will essentially be replaced as follows:
```js
const o = cds.lazified({
  aStaticProperty : require('foo'),
  get aLazyProperty() {
    let value = require('bar')
    Object.defineProperty(this,'aLazyProperty',{value,enumerable:true,writable:true})
    return value
  }
})
```



### cds.version  <i>  &#8674; string </i> {:#cds-version }

Returns the version of the `@sap/cds` package from which the current instance of the `cds` facade module was loaded.



### cds.home  <i>  &#8674; string </i> {:#cds-home }

Returns the pathname of the `@sap/cds` installation folder from which the current instance of the `cds` facade module was loaded.




{:.sub-section}



### cds.env  <i>  &#8674; { ... } </i> {:#cds-env }

Provides access to the effective configuration of the current process, transparently from various sources, including the local _package.json_ or _.cdsrc.json_, service bindings and process environments.

[Learn more about `cds.env`](cds-env){:.learn-more}

### cds.requires  <i>  &#8674; { ... } </i> {:#cds-requires }

... is a convenience shortcut to [`cds.env.requires`](#cds-env).




{:.sub-section}






### cds.app  <i>  = [express.Application](https://expressjs.com/de/4x/api.html#app) </i> {:#cds-app }
[express.js app]: #cds-app

The [express.js Application object](https://expressjs.com/de/4x/api.html#app) constructed during bootstrapping.

[Learn more about bootstrapping in `cds.server`.](./cds-serve){:.learn-more}






### cds.model  <i>  = [csn](../cds/csn) </i> {:#cds-model }

The effective [CDS model](../cds/csn) loaded during bootstrapping, which contains all service and entity definitions, including required services.

[Learn more about bootstrapping in `cds.server`.](./cds-serve){:.learn-more}




### cds.services  <i>  = { [cds.Services](services) } </i> {:#cds-services }

A dictionary and cache of all instances of [`cds.Service`](services) constructed through [`cds.serve`](cds-serve),
or connected to by [`cds.connect`](cds-connect) so far.

It’s an iterable object, so you can access individual services by name:
```js
const { CatalogService, db } = cds.services
```

... as well as iterate through all services:
```js
for (let each of cds.services) ...
```





### cds.db  <i>  = [cds.Service](services) </i> {:#cds-db }

A shortcut to `cds.services.db`, the primary database service connected to during bootstrapping, if any.

[Learn more about bootstrapping in `cds.server`.](./cds-serve){:.learn-more}




### cds.run, ... {:#cds-run}

If a primary database is connected (&rarr; [see `cds.db`](#cds-db)), the `cds` facade provides shortcuts to the database service's methods to run queries, that is:


| Method...    | &rarr; | ... is a shortcut for: |
|--------------|--------|------------------------|
| `cds.run`    | &rarr; | `cds.db.run`           |
| `cds.read`   | &rarr; | `cds.db.read`          |
| `cds.create` | &rarr; | `cds.db.create`        |
| `cds.update` | &rarr; | `cds.db.update`        |
| `cds.delete` | &rarr; | `cds.db.delete`        |
| `cds.insert` | &rarr; | `cds.db.insert`        |



### cds.context  <i>  &#8674; [cds.Event](events#cds-event) </i> {:#cds-context}

Reference to the current root [event](events#cds-event) or [request](events#cds-request), which acts as invocation context, providing access to the current `tenant` and `user` information, and also constitutes the transaction boundary for automatically managed transactions.



### cds.utils  <i>  &#8674; { ... } </i> {:#cds-utils }

Provides a set of utility functions.

| Function...  | &rarr; | ...provides utility
| ------------ | ------ | ----------------------- |
| `uuid`       | &rarr; | generates a new v4 UUID |
