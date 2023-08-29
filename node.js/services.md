---
shorty: Class <code>cds</code><i>.Service
# layout: node-js
# status: released
uacp: This page is linked from the Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/29c25e504fdb4752b0383d3c407f52a6.html
---

# Core Services APIs { #cds-service}


<!--- % include links-for-node.md %} -->


Class `cds.Service` is the base class for all [provided](cds-serve) and [connected](cds-connect) services.
As such, and complemented by [`cds.connect`](cds-connect) and [`cds.Request`](events), it provides the essential APIs
for implementing and consuming services.

Most frequently you would use these APIs from within [custom implementations](#srv-impls) of your provided services.
Here's an example from [cap/samples](https://github.com/sap-samples/cloud-cap-samples/tree/master/bookshop/srv/cat-service.js) with references to used APIs:

<table>
<tr>
<td markdown="1" style="font-size: 80%; border:none">

  ```js
  const cds = require('@sap/cds')

class CatalogService extends cds.ApplicationService { async init(){
  const db = await cds.connect.to ('db')
  const { Books } = db.entities ('sap.capire.bookshop')

  this.on ('submitOrder', async req => {
    const {book,quantity} = req.data
    let {stock} = await db.read (Books,book, b => b.stock)
    if (stock >= quantity) {
      await db.update (Books,book) .with ({ stock: stock -= quantity })
      await this.emit ('OrderedBook', { book, quantity, buyer:req.user.id })
      return req.reply ({ stock })
    }
    else return req.error (409,`${quantity} exceeds stock for book #${book}`)
  })

  this.after ('READ','Books', each => {
    if (each.stock > 111) each.title += ` -- 11% discount!`
  })
  await super.init()
}}

module.exports = { CatalogService }

  ```
</td>
<td markdown="1" style="font-size: 90%; border:none; white-space:nowrap">
<p style="font-weight:500; border-bottom: .5px solid #ccc">APIs used:</p>
<br>
<br>
<br> [Subclassing `cds.Service`](#srv-impls)
<br> [Using `cds.connect`](cds-connect)
<br> [Model Reflection](#srv-entities)
<br>
<br> [Handler Registration](#srv-on)
<br> [Using `req.data`](events#req-data)
<br> [Querying](#srv-run)
<br> [Messaging](#srv-emit)
<br> [Using `req.reply`](events#req-reply)
<br> [Using `req.error`](events#req-error)
<br>
<br>
<br> [Handler Registration](#srv-on)
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
</td>
</tr>
</table>


###### Content

<style scoped > ul strong { font-weight: 500 } </style>
<!--- % include _chapters toc="2,3" %} -->

## How to Implement Services {#srv-impls}

Service implementations are essentially collections of [event handlers] registered with service instances to handle incoming requests and event messages.
The sections below explain where and how to do so.


###  <i> **Where** to Implement Services? </i> {#srv-impl-where}

###  <i> <i>&#8627;</i> In sibling _.js_ files next to _.cds_ sources </i> {#srv-impl-in-sibling-js}

The easiest way to add service implementations is to simply place equally named _.js_ files next to the _.cds_ files containing the respective service definitions. In addition to direct siblings you can place them into relative subdirectories `./lib` or `./handlers`, allowing layouts like that:

<div style="display:flex">
<pre class="log" style="padding:15px; margin:10px; width:30%">
<b>srv/</b>
  <i># all in one</i>
  foo-srv.cds
  <em>foo-srv.js</em>
  bar-srv.cds
  <em>bar-srv.js</em>
</pre>

<pre class="log" style="padding:15px; margin:10px; width:30%">
<b>srv/</b>
  <b>lib/</b>
    <em>foo-srv.js</em>
    <em>bar-srv.js</em>
  foo-srv.cds
  bar-srv.cds
</pre>

<pre class="log" style="padding:15px; margin:10px; width:30%">
<b>srv/</b>
  <b>handlers/</b>
    <em>foo-srv.js</em>
    <em>bar-srv.js</em>
  foo-srv.cds
  bar-srv.cds
</pre>
</div>

Service implementations basically look like that:

```js
// srv/lib/foo-srv.js
const cds = require('@sap/cds')
class FooService extends cds.Service {...}
module.exports = FooService
```


###  <i> <span style="color:grey"><i>&#8627;</i> </span> In files specified in `@impl` annotations </i> {#impl-annotation}

Use the `@impl` annotation to specify alternative files to load implementations from:


```cds
// srv/services.cds
service FooService @(impl:'./lib/foo-service.js') {}
service BarService @(impl:'./lib/bar-service.js') {}
```
[Learn more in configuration options on `@impl`.](#srv-impl){.learn-more}


```js
// srv/lib/foo-service.js
const cds = require('@sap/cds')
class FooService extends cds.Service {...}
module.exports = FooService
```

```js
// srv/lib/bar-service.js
const cds = require('@sap/cds')
class BarService extends cds.Service {...}
module.exports = BarService
```


###  <i>  <span style="color:grey"><i>&#8627;</i> </span> With multiple implementations in one file </i>

Assumed you declared multiple services in the same _.cds_ file like that:

```cds
// srv/services.cds
service FooService {}
service BarService {}
```

Instead of providing separate implementation files [specified by `@impl` annotations](#impl-annotation),
you can also provide multiple implementations in a single sibling file like that:

```js
// srv/services.js
const cds = require('@sap/cds')
class FooService extends cds.Service {...}
class BarService extends cds.Service {...}
module.exports = { FooService, BarService }
```
> Note: The exported names are expected to match the names of the service definitions in your CDS model.



{.sub-section}


###  <i>  **How** to Implement Services? </i> {#srv-impl-how}





### <i><span style="color:grey"><i>&#8627;</i> </span> As subclasses of `cds.Service` </i> {#cds-service-subclasses}

You can create subclasses of `cds.Service`, or subclasses thereof, from service implementation modules like so:

```js
// for example, in srv/cat-service.js
const cds = require('@sap/cds')
class CatalogService extends cds.ApplicationService {
  async init() {
    const { Books } = this.entities
    // register your event handlers...
    this.before ('CREATE', Books, req => {...})
    this.on ('UPDATE', Books, req => {...}) // overrides the default handler
    // ensure to call super.init()
    await super.init()
  }
}
module.exports = CatalogService
```

The `init()` method acts like a parameter-less constructor. Ensure to call `await super.init()` as in the previous example, to have the base class's handlers added.

As also shown in the previous example, you may register own handlers before the base class's ones, to intercept requests before the default handlers snap in.

You can also overload API methods of `cds.Service`, or subclasses thereof.


### <span style="color:grey"><i>&#8627;</i> </span>  <i> As plain functions </i> {#cds-service-impl}

The simplest way to provide custom event handlers is to return a function that registers event handler with the instance of `cds.Service` as follows:

```js
module.exports = function(){ // `this` is the instance of cds.Service
  this.before (['CREATE','UPDATE'],'Books', (req)=>{...})
  this.on ('UPDATE','Books', (req)=>{...})
  this.after ('READ','Books', (books)=>{...})
}
```

Alternatively you can provide an arrow function like so:

```js
module.exports = (srv)=>{ // `srv` is the instance of cds.Service
  srv.on ('UPDATE','Books', (req)=>{...})
  // ...
}
```

### <span style="color:grey"><i>&#8627;</i> </span>  <i> With `async/await` </i>

Quite frequently you need to call async functions in your impl functions, just declare your impl function as `async` to use `await` inside:

```js
const cds = require('@sap/cds')
module.exports = async function(){
  const SomeOtherService = await cds.connect.to('SomeOtherService')
  // ...
}
```

### <span style="color:grey"><i>&#8627;</i> </span>  <i> Wrapped with `cds.service.impl` </i> <!-- TODO duplicated id attribute {#cds-service-impl}-->

Wrap the impl function into `cds.service.impl(...)`, which simply returns the function but gives you code assists in tools like VS Code:

```js
const cds = require('@sap/cds')
module.exports = cds.service.impl (function(){ ... })
```


<!--- Migrated: @external/node.js/cds.Services/12-srv-options-.md -> @external/node.js/cds.services/srv-options-.md -->
## Configuration / Annotations { #srv-options }

Following are options used to control the construction of services, as either of:

- Annotations of corresponding service definitions
- Options in [service configurations](cds-connect#cds-env-requires)
- Options arguments in calls to [`cds.serve`](cds-serve)
- Options arguments in calls to [`cds.connect`](cds-connect)

<!--- % assign o = '<span style="color:grey; font-weight:normal"> &nbsp;|&nbsp; o</span>' %} -->



### @impl <span style="color:grey; font-weight:normal"> &nbsp;|&nbsp; o</span>.impl  <i>  = class | instance | function | module name </i> {#srv-impl}

Use the `impl` option specify the implementation used by this service.

##### Using the `@impl` Annotation

Add an `@impl` annotation to your service definition referring to a file in your project to load the implementation from:

```cds
// leading ./ -> relative to the .cds source
service FooService @(impl:'./lib/foo-service') {...}
// otherwise -> relative to project root
service BarService @(impl:'src/lib/bar-service') {...}
```

##### Using `cds.requires.<service>.impl` in Configurations

For _required_ services you can specify a custom implementation to use like so:

```json
"cds": {
  "requires": {
    "reviews-service": {
      "kind": "odata",
      "impl": "srv/external/reviews-service"
    },
  }
}
```


##### As ad-hoc options to [`cds.serve`](cds-serve) or [`cds.connect`](cds-connect)

You can also specify ad-hoc options in calls to [`cds.serve`](cds-serve) or [`cds.connect`](cds-connect) like so:

```js
const ReviewsService = await cds.connect.to ('reviews-service', {
  impl: 'srv/external/reviews-service'
})
```

In this case, you can also specify an impl function, as subclass of `cds.Service` or an instance of such like so:

```js
const ReviewsService = await cds.connect.to ('reviews-service', {
  impl: 'srv/external/reviews-service'
})
```



### @kind <span style="color:grey; font-weight:normal"> &nbsp;|&nbsp; o</span>.kind  <i>  = cds.requires.\<kind\> </i> {#srv-kind}

Use option `kind` to refer to an entry in the [`cds.requires`](cds-connect#cds-env-requires) config options, which in turn contains presets for the other options, in particular for [`impl`](#srv-impl).


##### For _Required_ Services

In case of required services, you need to specify option `kind` in respective entries to the [`cds.requires`](cds-connect#cds-env-requires) config option like so:

```json
"cds": {
  "requires": {
    "reviews-service": { "kind": "odata" },
    "db": { "kind": "sql" },
  }
}
```

The values usually refer to these pre-defined options:

* `sql`, `sqlite`, `hana` &rarr; for _database services_
* `odata`, `rest` &rarr; for _external services_
* `enterprise-messaging`, `file-based-messaging` &rarr; for _messaging services_

[Run `cds env get requires` to see all default configurations.](cds-env#cli){.learn-more}


##### For _Provided_ Services

For services provided by your app, the default is `kind = 'app-service'`, which is configured in built-in defaults like so:

```json
"cds": {
  "requires": {
    "app-service": { "impl": "@sap/cds/lib/srv/ApplicationService.js" }
  }
}
```

[Run `cds env get requires.app-service` to see the concrete default config.](cds-env#cli){.learn-more}



In effect, `cds.serve` constructs instances of [`cds.ApplicationService`](./app-services) by default.


##### Using Custom Kinds

You can override this by adding a `@kind` annotation to your service definition:

```cds
service FooService @(kind:'app-service') {...} // default
service BarService @(kind:'bar-service') {...} // custom
```

... backed by a corresponding entry to [`cds.requires`](cds-connect#cds-env-requires) config options:

```json
"cds": {
  "requires": {
    "bar-service": { "impl": "srv/bar-service.js" },
  }
}
```



### @path <span style="color:grey; font-weight:normal"> &nbsp;|&nbsp; o</span>.path  <i>  = string </i> {#srv-path}

By default `cds.serve` determines the endpoints to serve individual services from the service definition's name, by 'slugifying' camel-case names, and removing `'Service'` suffixes like that:

`SomeBookshopAdminService` &rarr; `some-bookshop-admin`

### @protocol <span style="color:grey; font-weight:normal"> &nbsp;|&nbsp; o</span>.protocol  <i>  = string </i> {#srv-protocol}

With the annotation `@protocol`, you can configure a protocol adapter a service should be served by. By default, a service is served by the `odata-v4` adapter. The supported protocol adapters are `odata` (serve `odata-v4`), `odata-v4`, `rest`, `none` (to disable a service and mark it as internal).

Example:
```cds
@protocol: 'rest'
service CatalogService {
    ...
}
```

<div id="beforecredentials" />

### @credentials <span style="color:grey; font-weight:normal"> &nbsp;|&nbsp; o</span>.credentials  <i>  = { url, ... } </i> {#srv-credentials}


Specific options, passed to services. For example, in case of a SQLite database service these are driver-specific options [node-sqlite3](https://github.com/mapbox/node-sqlite3)

### @model <span style="color:grey; font-weight:normal"> &nbsp;|&nbsp; o</span>.model  <i>  = [csn](../cds/csn) </i> <!--{#srv-model}-->


The model to use for this connection, either as an already parsed [csn](../cds/csn) or as a filename of a model, which is then loaded with [`cds.load`].


<!--- Migrated: @external/node.js/cds.Services/42-srv-reflect-.md -> @external/node.js/cds.services/srv-reflect-.md -->

{.sub-section}

## Model Reflection API {#srv-reflect }

### <span style="color:#800; font-weight:500">srv</span>.name  <i>  = string </i>

<div class='indent' markdown="1">

The service's name, that means, the [definition's](../cds/csn#services) name for services constructed with [`cds.serve`], or the name of [required](cds-connect#cds-env-requires) services as passed to [`cds.connect`](cds-connect).

```js
cds.serve ('CatalogService')   //> .name = 'CatalogService'
cds.connect.to ('audit-log')   //> .name = 'audit-log'
cds.connect.to ('db')          //> .name = 'db'
```
</div>



### srv.model  <i>  = [csn](../cds/csn)  </i> { #srv-model}

<div class='indent' markdown="1">

The [linked model](cds-reflect#cds-reflect) from which this service's [definition](#srv-definition) was loaded.

This is === [`cds.model`](cds-facade#cds-model) by default, that is, unless you created services yourself with [`cds.serve`](./cds-serve.md), specifying alternative models to load and construct new services from.
</div>

### srv.definition  <i>  &#8674; [def] </i> { #srv-definition}

<div class='indent' markdown="1">

The [linked](cds-reflect#cds-reflect) [service definition](../cds/csn#services) contained in the [model](#srv-model) which served as the blueprint for the given service instance.
</div>

### srv.namespace <i> &#8674; string </i> {.first-of-many}
### srv.entities <i> (namespace) &#8674; {[defs]} </i>
### srv.events <i> (namespace) &#8674; {[defs]} </i>
### srv.operations <i> (namespace) &#8674; {[defs]} </i> {#srv-entities}

[definitions]: ../cds/csn#definitions
[defs]: ../cds/csn#definitions
[def]: ../cds/csn#definitions
[events]: ../cds/csn#definitions
[entities]: ../cds/csn#entity-definitions
[operations]: ../cds/csn#actions-functions


<div class='indent' markdown="1">

These methods provide convenient access to the linked [definitions](../cds/csn#definitions) of all [entities](../cds/csn#entity-definitions), [events](../cds/csn#definitions), as well as [actions and functions](../cds/csn#actions-functions) provided by this service.

```js
const db = await cds.connect.to('db')
const { Books, Authors } = db.entities('my.bookshop')
```
{.indent}

These methods are actually shortcuts to their [counterparts provided by linked models](cds-reflect#linked-csn), with the default namespace being the service definition's name.


##### Using Fully Qualified Names:

Many service consumption methods, such as [`srv.run`] expect fully qualified names of entities or an entity definition.
Using these reflection methods greatly simplifies code as it avoids repeating namespaces all over the place.

For example, the fully qualified name of entity `Books` in [_cap/samples/bookshop_](https://github.com/sap-samples/cloud-cap-samples/tree/master/bookshop/db/schema.cds) is `sap.capire.bookshop.Books`. So, queries would have to be written like that using name strings:

```js
const books = await cds.read ('sap.capire.bookshop.Books')
```
So, rather prefer that pattern:

```js
const { Books } = cds.entities
const books = await cds.read (Books)
```

</div>


<!--- Migrated: @external/node.js/cds.Services/43-srv-handlers-.md -> @external/node.js/cds.services/srv-handlers-.md -->

{.sub-section}


## Handler Registration API { #event-handlers }
[Event handlers]: #event-handlers
[event handlers]: #event-handlers
[event handler]: #event-handlers


Register event handlers with instances of [`cds.Service`](services) to add custom logic to serve operations or react to events emitted by these services.


### srv.on  <i>  (event, path?, handler) &#8674; this </i> { #srv-on}
[`srv.on`]: #srv-on

Handlers registered with this method are run in sequence, with each handler being able to terminate the sequence (cf. _Outcomes_ below). This termination capability in combination with registering handlers using [`srv.prepend`], lets you register custom handlers to run _instead of_ the generic ones. If you want to defer to the generic handlers, invoke `next` in your custom handler (see _Handling Examples_ below).


**Arguments:**

* `event` — name of a single event or an array of multiple such
* `path` — entity CSN object, name of an exposed entity, a path, or an array of multiple such
* `handler(req, next)` — the handler function

A service handler registered by entity name can use a relative or fully qualified name, containing the service namespace. A database handler needs a fully qualified entity name.

[learn more about the `req` argument in handler functions.](events#cds-request){ .learn-more}


**Registration Examples:**

```js
// Direct request, for example, GET /Books
srv.on('READ','Books', (req)=>{...})
// Registration by fully-qualified name, for example, GET /Books
srv.on('READ','serviceName.Books', (req)=>{...})
// Navigation requests, for example, GET /Authors/201/authors
srv.on('READ','Authors/books', (req)=>{ let [ID] = req.params; ...})
// Registration by CSN, for example, GET /Books
srv.on('READ', Books, (req)=>{...})
// Calls to unbound actions/functions
srv.on('cancelOrder', (req)=>{...})
// Calls to bound actions/functions
srv.on('cancel','Order', (req)=>{...})
```


**Handling Examples:**

Requests can be handled in one of the following ways:

1. Call [`req.reply`] synchronously or asynchronously:
```js
srv.on('READ','Books', async (req)=> req.reply(await cds.tx(req).run(...))
srv.on('READ','Books', (req)=> req.reply(...))
```
2. Return results or a Promise resolving to some &rarr; framework calls [`req.reply`]:
```js
srv.on('READ','Books', (req)=> cds.tx(req).run(...))
srv.on('READ','Books', (req)=> [ ... ])
```
3. Return a [`cds.ql`](cds-ql) object &rarr; framework does [`cds.run`] and [`req.reply`]:
```js
srv.on('READ','Books', ()=> SELECT.from(Books))
```
4. Call `next` as in [express.js](https://expressjs.com) to delegate to handlers down the chain:
```js
srv.on('READ','Books', (req,next)=>{
  if (...) return SELECT.from(Books) //> ... handle req my own
  else return next()  //> delegate to next/default handlers
})
```
> **IMPORTANT:**
- Ensure to properly add calls to `next()` in your promise chain, either using `await` or by passing through its return value as shown in the previous example.
- The result of `await next()` depends on `req.query`. For example, for `GET /Books` the result will be an array, whereas for `GET /Books/1` the result is an object.

5. Reject the request through [`req.reject`], `throw`, or returning a rejecting Promise:
```js
srv.on('READ','Books', (req)=> req.reject(409,'...'))
srv.on('READ','Books', (req)=> Promise.reject(...))
srv.on('READ','Books', (req)=> { throw ... })
```



**Shortcuts:**

As a yet more convenient shortcut to 3. you can just pass in the [`cds.ql`](cds-ql) object instead of a handler function; so, overall, these examples are equivalent:

```js
const {Books} = srv.entities
srv.on('READ','Books', (req)=> cds.tx(req).run(SELECT.from(Books))
srv.on('READ','Books', ()=> SELECT.from(Books))
srv.on('READ','Books', SELECT.from(Books))
```




####  <i>  Multiple handlers for same events </i>

Arbitrary numbers of handlers for the same events can be registered. Those registered with `.on` are executed in order of their registration, while those registered with `.before` or `.after` the execution order isn’t guaranteed; they might be executed in parallel.

```js
cds.serve('cat-service') .with (function(){
  this.on('READ', Books, ()=>{/* called first */})
  this.on('READ', Books, ()=>{/* called second */})
})
```

####  <i>  Single handlers for multiple events </i>

Omit the `<entity>` argument to register handlers for all entities. Or add handlers for all events as well as [standard express.js middlewares](https://expressjs.com/en/guide/writing-middleware.html) with method `.use`:

```js
cds.serve('cat-service') .with (function(){
  this.on ('READ', ()=> {/* handles read events on all entities */})
  this.on ('*', ()=> {/* handles all events on all entities */})
})
```




#### srv.on  <i>  ('error', (err, req) => {}) </i> {#srv-on-error}

Using the special event name `error`, you can register a custom error handler that is invoked whenever an error will be returned to the client. The handler receives the error object `err` and the respective request object `req`. Only synchronous modifications of the error object are allowed.

**Examples:**

```js
cds.serve('cat-service') .with (function(){
  this.on ('error', (err, req) => {
    // modify the message
    err.message = 'Oh no! ' + err.message
    // attach some custom data
    err['@myCustomProperty'] = 'Hello, World!'
  })
})
```

::: warning
Note: Depending on when the error occurs, the request's [continuation](cds-tx#event-contexts) (that is, `cds.context`) may be `undefined` or incomplete (for example, missing user information).
:::

The error is subsequently processed for the client following [OData's Error Response Body format](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ErrorResponseBody). Hence, if you want to add custom properties, they must be prefixed with `@` in order to not be purged.




### srv.before  <i>  (event, entity?, handler) &#8674; this </i> {#srv-before}

Registers a handler to run _before_ the ones registered with [`.on()`](#srv-on), that is, before the generic handlers. Commonly used to add custom input validations.


**Arguments** are the same as in [`srv.on`], except that the handler only has the request argument (that is, `handler(req)`).


**Examples:**

```js
this.before ('CREATE','Order', (req)=>{
  const order = req.data
  if (order.quantity > 11)  throw 'Order quantity must not exceed 11'
})
```

[learn more about the `req` argument in handler functions](events#cds-request){ .learn-more}

You can as well trigger additional operations in before handlers:

```js
srv.before ('CREATE','Order', (req)=>{
  const order = req.data
  return UPDATE(Books).set ('stock -=', order.quantity)
})
```

> Note: This example would fail assumed you have a constraint on book stocks to not become negative, so the UPDATE also acts as a validation.

**Note:**

* All before handlers are executed in order of their registration.
* Always return a promise if your handlers trigger asynchronous tasks.
* All promises returned are collected in a `Promise.all` and
* The next phase running the [`.on`](#srv-on) handlers starts when all promises resolved.

Hence: You can terminate requests early by throwing exceptions or through [`req.reject`] in the handlers' synchronous parts. Asynchronous parts however run in parallel, so you can't react on side-effects between _.before_ handlers.





### srv.after  <i>  (event, entity?, handler) &#8674; this </i> {#srv-after}

Registers a handler to run _after_ the generic handler. To be more precise: It runs on the results returned by the generic handler (which is asynchronous to the incoming handlers). Use it to modify the response.


**Arguments** are the same as in [`srv.on`], except that the handler has the result as first and the request as second argument (that is, `handler(data, req)`).


> Note: The type of the result (that means, array, object, primitive, etc.) depends on the respective request.


**Example:**

```js
this.after('READ','Books', (books)=>{
  for (let each of books) each.stock > 111 && each.discount='11%'
})
```


**Name the event or the param `each`** as convenience shortcut for a per-row handler:

```js
this.after('each','Books', (book)=>{
  book.stock > 111 && book.discount='11%'
})
```

```js
this.after('READ','Books', (each)=>{
  each.stock > 111 && each.discount='11%'
})
```

> Note: This is only meant for synchronous code due to performance.
> Note: Parameter `each` is not minifier-safe.


**Use the secondary param `req`** in case you need to reflect on the inbound request:

```js
this.after('READ','Books', (books,req)=>{
  if (req.data.ID) ...
})
```


**Only modifications are allowed.** That is, replacing the result like in the following example isn’t possible:

```js
this.after('READ','Books', (books)=>{
  return \<something else...\>
})
```

> Reasoning: Multiple after handlers can be added by different involved packages, including extension packages, and each of which would expect the same input. If one would exchange the results, the chain would break.

> Keep in mind that all after handlers are executed in parallel via `Promise.all()` so they must not have side-effects!

To replace the result, use `on` handlers as follows:

```js
this.on('READ','Books', async (req,next)=>{
  const books = await next()
  return \<something else...\>
})
```

In case the result is a primitive, for example, a string, then also synchronous modifications must be done in an `on` handler as the change would stay local to the after handler (_pass by value_).



### srv.reject  <i>  (event, entity?) &#8674; this </i>

Registers a generic handler that automatically rejects incoming request with a standard error message. You can specify multiple events and entities.


**Arguments:**

* `event` — name of a single event or an array of multiple such
* `entity` — name of an exposed entity or an array of multiple such

**Examples:**

```js
this.reject ('READ', 'Orders')
this.reject (['CREATE','UPDATE','DELETE'], ['Books','Authors'])
```


### srv.prepend  <i>  (function) </i> {#srv-prepend}

Use `srv.prepend` in order to register handlers, which shall be executed before already registered handlers.
In particular, this can be used to override handlers from reused services as in [cap/samples/bookstore/srv/mashup.js](https://github.com/sap-samples/cloud-cap-samples/tree/main/bookstore/srv/mashup.js):

For example, the following would register a handler for inserting Orders that runs _instead of_ the default handlers of the connected database service.

```js
const CatalogService = await cds.connect.to ('CatalogService')
const ReviewsService = await cds.connect.to ('ReviewsService')

//
// Delegate requests to read reviews to the ReviewsService
// Note: prepend is necessary to intercept generic default handler
//
CatalogService.prepend (srv => srv.on ('READ', 'Books/reviews', (req) => {
  console.debug ('> delegating request to ReviewsService')
  const [id] = req.params, { columns, limit } = req.query.SELECT
  return ReviewsService.read ('Reviews',columns).limit(limit).where({subject:String(id)})
}))
```

You could also use that to add support for custom behavior to generic database services:
```js
const db = await cds.connect.to('db')
db.prepend (()=>{
  db.on ('INSERT','Orders', req => {...})
})
```



###  <i> For _Common CRUD_ and _REST-style_ Events </i>

CAP service definitions frequently provide data-centric APIs by exposing projections on underlying domain model entities as introduced in the [Getting Started guide](../get-started/in-a-nutshell#defining-services):

```cds
using { sap.capire.bookshop as my } from '../db/schema';
service AdminService {
  entity Books as projection on my.Books;
  entity Authors as projection on my.Authors;
}
```

In effect, CAP will provide generic service providers, which serve corresponding CRUD request (for OData) which map to corresponding REST Request as follows:

For AdminService at `/admin` endpoint

| REST Paths        | CRUD Operation   |
|-------------------|------------------|
| `POST` _/Books_   | `CREATE` _Books_ |
| `GET` _/Books_    | `READ` _Books_   |
| `PUT` _/Books_    | `UPDATE` _Books_ |
| `DELETE` _/Books_ | `DELETE` _Books_ |

> In addition, CAP provides built-in support for **Fiori Draft**, which add additional CRUD events, like `NEW`, `EDIT`, `PATCH`, and `SAVE`.
> [&rarr; Learn more about Fiori Drafts](../advanced/fiori#draft-support)

For each of which you can add custom handlers, either by specifying the CRUD operation or by specifying the corresponding REST method as follows:

```js
// srv/admin-service.js
const cds = require('@sap/cds')
module.exports = cds.service.impl (function(){
  // CRUD-style handler registration        REST-style registration
  this.on ('READ','Books', ...)   /* or: */ this.on ('GET','Books', ...)
  this.on ('CREATE','Books', ...) /* or: */ this.on ('POST','Books', ...)
  //...
})
```


###  <i> For _Custom_ Events, i.e., _Actions_ and _Functions_ </i>


In addition to the common CRUD and REST events, you can declare custom events as [actions or functions](../cds/cdl#actions).

```cds
service CatalogService { ...
  action submitOrder (book: Books:ID, quantity: Integer);
  function getMyOrders() returns array of Orders;
}
```

Register handlers for these as follows:

```js
// srv/admin-service.js
const cds = require('@sap/cds')
module.exports = cds.service.impl (function(){
  this.on ('submitOrder', (req) => {...})
  this.on ('getMyOrders', (req) => {...})
})
```


###  <i> For _Provided_ and _Connected_ Services </i>



Most frequently you would add event handlers to _provided_ services. Yet, you can also add handlers to services _consumed_ in your project, even to generic services provided by the CAP framework itself, like the default database service:

```js
const db = await cds.connect.to('db')
db.before ('INSERT','Orders', req => {...})
db.after ('READ','*', each => {...})
```



###  <i> For _Synchronous_ and _Asynchronous_ Events </i>

The APIs documented below are used to register handlers for _synchronous_ requests as well as for subscription to _asynchronous_ events.

For example, given this service definition:
```cds
service ReviewsService { //...
  event reviewed : { subject: String; rating: Decimal }
}
```
... an event subscription and handling would look like that.
```js
const ReviewsService = await cds.connect.to('ReviewsService')
ReviewsService.on ('reviewed', (msg) => {...})
```

[Learn more about **Messaging API**](#srv-emit){.learn-more}


## Messaging API  { #srv-emit }
[`srv.emit`]: #srv-emit

### srv.emit  <i>  ({ event, data?, headers? })  </i>

This is the basic method to send both, [asynchronous event messages](messaging), as well as synchronous [requests](events).
The implementation constructs an instance of [`cds.Event`], which is then dispatched through all registered [event handlers](#event-handlers).


_**Common Usages:**_

<div class="indent" markdown="1">

You can use `srv.emit` as a basic and flexible alternative to [`srv.run`](#srv-run), for example to send queries plus additional request `headers` to remote services:

```js
const query = SELECT.from(Foo), tx = srv.tx(req)
tx.run (query)       //> without custom headers
tx.emit ({ query })  //> equivalent to tx.run()
tx.emit ({ query, headers:{...} })
```

A typical usage for asynchronous messages looks like that:

```js
this.emit ({ event:'reviewed', data:{ subject, rating }, ... })
this.emit ('reviewed', { subject, rating }) //> see below
```

[Learn more about Event Messages.](events#cds-event){.learn-more}
[Learn more about Requests.](events#cds-request){.learn-more}

</div>

_**Returns**_ a _Promise_ resolving to the response of respective event handlers.

[For results of queries, see `srv.run`.](#srv-run){.learn-more}



### srv.emit  <i>  (event, data?, headers?)  </i>

Convenience variant to [`srv.emit`](#srv-emit), which allows to specify the primary properties for [emitting asynchronous event messages](messaging).
Here's an example from [_cap/samples/reviews_](https://github.com/sap-samples/cloud-cap-samples/tree/master/reviews/srv/reviews-service.js):

```js
this.emit ('reviewed', { subject, rating })
```


### srv.on  <i>  (event, handler) &#8674; this </i> {#srv-on-event}

Subscribe to asynchronous events by registering handlers using the common `srv.on()` method.

For example, given this service definition:
```cds
service ReviewsService { //...
  event reviewed : { subject: String; rating: Decimal }
}
```
... an event subscription and handling would look like that.
```js
const ReviewsService = await cds.connect.to('ReviewsService')
ReviewsService.on ('reviewed', (msg) => {...})
```

There's one major difference, though: Handlers for synchronous requests execute as **interceptors**, which pass control to subsequent handlers by calling `next()`, handlers for asynchronous events execute as **listeners** with all registered handlers being executed without calling `next()`.


## REST-style API {#srv-send }
[`srv.send`]: #srv-send

### <span style="color:#800; font-weight:500">srv</span>.send <i> ({ (method, path) | query | event, data?, headers?, </i>...<i>}) &#8674; results </i>

This is a convenience alternative to [`srv.emit`](#srv-emit) method to send both, [asynchronous event messages](messaging), as well as synchronous [requests](events). The implementation constructs an instance of [`cds.Request`](events.md), which is then dispatched through all registered [event handlers](#event-handlers).

_**Common Usages:**_

<div class="indent" markdown="1">

`srv.send` can be used in a manner similar to [`srv.emit`](#srv-send) to send requests using [HTTP methods](events#method) and additional request `headers` if necessary:

```js
const srv = await cds.connect.to('SomeService')
const data = { ID: 111, name: 'Mark Twain' }
const headers = {...}
await srv.send({ method: 'POST', path: 'Authors', data, headers }) //> send HTTP request
srv.send({ event: 'AuthorCreated', data, headers })
```

[Learn more about `cds.Requests`.](events#cds-request){.learn-more}
[Learn more about Event Messages.](events#cds-event){.learn-more}

Alternatively queries in _[CQN](../cds/cqn)_ notation can be used:

```js
const { Books, Authors } = srv.entities //> reflection
await srv.send({ query: INSERT.into(Authors, { ID: 111, name: 'Mark Twain' }) }) //> without custom headers
const query = [SELECT.from(Books), SELECT.from(Authors)]
const headers = {...}
const [books, authors] = await srv.send({ query, headers })
```

[Learn more about using queries in `srv.run`.](#srv-run-query){.learn-more}
[Learn more about service-related **reflection** using `srv.entities`.](#srv-entities){.learn-more}

</div>


_**Returns**_ a _Promise_ resolving to the response of a respective request.

[For results of queries, see `srv.run`.](#srv-run){.learn-more}

### <span style="color:#800; font-weight:500">srv</span>.send <i> (method, path, data?, headers?) &#8674; results </i>

A variant of [`srv.send`] which allows to specify the primary properties for [sending requests](events#cds-request):

```js
const twain = await srv.send('GET', 'Authors(111)')
const headers = {...}
const data = { ID: 222, title: 'The Adventures of Tom Sawyer', author: { ID: twain.ID } }
await srv.send('POST', 'Books', data, headers)
```

### srv.send <i> (method, data?, headers?) &#8674; results </i> {#srvsend-method-data-headers}

A variant of [`srv.send`](#srv-send) which, allows to specify the primary properties for [sending requests](events#cds-request) targeting unbound actions or functions:

```js
await srv.send('submitOrder', { book: 251, quantity: 1 })
```

###  <i>  Convenient Shortcuts: </i>
### <span style="color:#800; font-weight:500">srv</span>.get <i> (entity | path, data?) </i>...<i> &#8674; results </i>
### <span style="color:#800; font-weight:500">srv</span>.put <i> (entity | path, data?) </i>...<i> &#8674; results </i>
### <span style="color:#800; font-weight:500">srv</span>.post <i> (entity | path, data?) </i>...<i> &#8674; results </i>
### <span style="color:#800; font-weight:500">srv</span>.patch <i> (entity | path, data?) </i>...<i> &#8674; results </i>
### <span style="color:#800; font-weight:500">srv</span>.delete <i> (entity | path, data?) </i>...<i> &#8674; results </i>

These methods are _HTTP method-style_ counterparts to the [_CRUD-style_ convenience methods](#srv-run).
As with these, the returned queries can be executed with `await`.
For invoking actions or functions, do not use `.post()` or `.get()` but see [Actions API](#srv-action).

REST and OData services support these basic HTTP methods, which are mapped to their CRUD counterpart as documented in the following. They can be used to construct data queries as with the CRUD variants as well as be used to send plain HTTP requests.

_**Common Usages:**_

```js
await srv.get(Books).where({ID:111})
await srv.post(Books).entries({ID:111, ...})
await srv.patch(Books,111).with({...})
await srv.delete(Books,111)
```
{.indent}

These are equivalent to:

```js
await srv.read(Books).where({ID:111})
await srv.create(Books).entries({ID:111, ...})
await srv.update(Books,111).with({...})
await srv.delete(Books,111)
```
{.indent}
> Note: `UPDATE` translates to `PATCH`, not `PUT`.
{.indent}


_**Plain REST Usages:**_

While the previous usage samples still constructed queries, and rather worked as using syntax aliases, you can also use these methods to send plain, arbitrary HTTP requests to remote services. Just pass a string starting with `/` as the first argument to do so:

```js
srv.post('/some/arbitrary/path', {foo:'bar'})
srv.get('/some/arbitrary/path/111')
srv.patch('/some/arbitrary/path', {foo:'bar'})
srv.delete('/some/arbitrary/path/111')
```

## Querying API {#srv-run }
[`cds.run`]: #srv-run
[`srv.run`]: #srv-run


### <span style="color:#800; font-weight:500">srv</span>.run  <i>  ([query](../cds/cqn)) &#8594; results </i> {#srv-run-query}

This is the central function to run queries. It expects a query or an array of queries in _[CQN](../cds/cqn)_ notation,
and returns a _Promise_ resolving to the queries' results.

_**Common Usage:**_

```js
const srv = await cds.connect.to ('SomeService')
const { Books, Authors } = srv.entities //> reflection
const books = await srv.run (SELECT.from(Books))
const [books, authors] = await srv.run ([SELECT.from(Books), SELECT.from(Authors)])
```
{.indent}

[Learn more about service-related **reflection** using `srv.entities`.](#srv-entities){.learn-more}
[Learn more about `srv.run` variant to send native query string.](#srv-run-sql){.learn-more .indent}

::: tip
If an array of queries is passed to `srv.run`, queries are run in parallel.
:::

_**Returns** a Promise resolving to..._

* to a number-like object indicating affected rows in case of `UPDATE`, `DELETE`.
* an iterable allowing to reflect on (generated) primary keys
* an array of rows for `SELECT` queries

For example, you can use results like so:
```js
const tx = cds.tx(req)
const [ Emily, Charlotte ] = await tx.run (INSERT.into (Authors,[
   {name:'Emily Brontë'},
   {name:'Charlotte Brontë'},
]))
await tx.run (INSERT.into(Books).columns('title','author_ID').rows(
   [ 'Wuthering Heights', Emily.ID ],
   [ 'Jayne Eyre', Charlotte.ID ],
))
const books = await tx.run (SELECT.from(Books))
const affectedRows = UPDATE(Books,books[0].ID)
  .with(`stock -=`,order.quantity)
  .where(`stock>=`,order.quantity)
if (affectedRows < 1) req.reject(409,'Sold out, sorry')
```


### <span style="color:#800; font-weight:500">srv</span>.run  <i>  (string, args?) &#8594; results </i> { #srv-run-sql}

Variant of [`srv.run`](#srv-run) which accepts native query strings, as understood by the receiving service, instead of [CQN](../cds/cqn) queries. For example, a SQL string in case of a connected SQL database.

_**Common Usage:**_

```js
cds.run (`SELECT * from sap_capire_bookshop_Books`)
cds.run (`CALL Some_Stored_Procedure (11,'foo')`)
cds.run (`SELECT * from Some_Table_Function (11,'foo')`)
```
::: tip
You need to pass fully qualified database table names.
:::


_**Passing Arguments:**_

Argument `args` is an optional array or object of binding parameters bound to respective placeholders in the query using one of these placeholders:

* `:name` — named parameters bound to respective entries in an `args` object
* `?` — positional parameters bound to entries of `args` in order of occurrence

```js
cds.run ('SELECT * from Authors where name like ?',['%Poe%'])
```
::: tip
Prefer that over concatenating values into query strings to avoid SQL injection.
:::


###  <i>  Convenient Shortcuts: </i>
### <span style="color:#800; font-weight:500">srv</span>.read <i> (entity, key?, projection?) </i>...<i> &#8674; [`SELECT` query](cds-ql#select) </i>
### <span style="color:#800; font-weight:500">srv</span>.create <i> (entity, key?) </i>...<i> &#8674; [`INSERT` query](cds-ql#insert) </i>
### <span style="color:#800; font-weight:500">srv</span>.update <i> (entity, key?) </i>...<i> &#8674; [`UPDATE` query](cds-ql#update) </i>
### <span style="color:#800; font-weight:500">srv</span>.delete <i> (entity, key?) </i>...<i> &#8674; [`DELETE` query](cds-ql#delete) </i>

These methods construct queries in a _fluent method-call style_ instead of the _Embedded QL_ style provided by [`cds.ql`](cds-ql).
The returned queries can be executed with `await`.

A typical usage is as follows:

```js
const books = await cds.read('Books').orderBy('title')
```
{.indent}


Essentially, each of these methods simply starts a fluent query construction using their [`cds.ql`](cds-ql) counterparts, which can be continued using the respective tail methods, and sent to the service backend upon invocation of `.then()`. For example, think of the implementation of `cds.read` as follows:

```js
read (entity) {
  const q = SELECT.from(entity)
  return Object.assign (q, { then:(r,e) => this.run(q).then(r,e) }
}
```


The following three variants to read Books are equivalent:

```js
const books1 = await cds.run(SELECT.from(Books).where({ID:111}))
const books2 = await cds.read(Books).where({ID:111})
const books3 = await SELECT.from(Books).where({ID:111})
```


### <span style="color:#800; font-weight:500">srv</span>.insert <i> (data) </i> .into <i> (entity) </i>...<i> &#8674; [`INSERT` query](cds-ql#insert) </i>

Method `srv.insert` is a SQL-reminiscent variant of `srv.create` with the following being equivalent:

```js
srv.insert(data) .into (entity)
srv.create(entity) .entries (data)
```

### <span style="color:#800; font-weight:500">srv</span>.upsert <i> (data) </i> .into <i> (entity) </i>...<i> &#8674; [`UPSERT` query](cds-ql#upsert) </i>

Method `srv.upsert` inserts an entity or updates it if it doesn't exist.

```js
srv.upsert(data) .into (entity)
```

### <span style="color:#800; font-weight:500">srv</span>.exists <i> (entity) </i>.where<i>(keys) </i>...<i> &#8594; [`SELECT` query](cds-ql#select) </i>

Method `srv.exists` returns a truthy value if the entity exists. It returns a falsy value otherwise:

```js
const bookExists = await srv.exists(Books).where({ ID: 5 })
if (bookExists) {
    ...
}
```

<!--- Migrated: @external/node.js/cds.Services/44d-srv-actions-.md -> @external/node.js/cds.services/44d-srv-actions-.md -->
## Actions API {#srv-action }

In case you declared custom actions and functions in the service definition of a [_connected_](cds-connect) or [_provided_](cds-serve) service, the respective instance of `cds.Service` will automatically be equipped with corresponding JavaScript methods, allowing you to write code similar to `srv.create/read/...`.


###  <i>  Unbound Actions / Functions </i>

For example, with that service definition (taken from [cap/samples/bookshop](https://github.com/sap-samples/cloud-cap-samples/tree/master/bookshop/srv/cat-service.cds)):

```cds
service CatalogService { ...
  action submitOrder (book: Books:ID, quantity: Integer);
}
```

You can invoke the declared `submitOrder` action from your code as follows:

```js
const cats = await cds.connect.to('CatalogService')
// basic variant using srv.send
const res1 = await cats.send('submitOrder',{ book: 251, quantity: 1 })
// named args variant
const res2 = await cats.submitOrder ({ book: 251, quantity: 1 })
// positional args variant
const res3 = await cats.submitOrder (251, 1)
```


###  <i>  Bound Actions / Functions </i>

Bound actions have two implicit leading arguments with the target entity's name and primary key.
Assumed we had a bound action like that:

```cds
service CatalogService { ...
  entity Books { ... } actions {
    action submitOrder (quantity: Integer);
  }
}
```

Then, you'd invoke that as follows:

```js
const cats = await cds.connect.to('CatalogService')
const res3 = await cats.submitOrder ('Books', 251, 1)
```

## Streaming API {#srv-stream }

::: warning
Streaming is currently limited to [database services](databases).
:::

### srv.stream<i> (column) </i> .from<i> (entity) </i> .where<i> (filter) &#8674; [Readable Stream](https://nodejs.org/api/stream.html) </i>

This method allows streaming binary data properties.
It returns a read stream which can be used to pipe to write streams, as shown in the following examples.

```js
const stream = srv.stream().from('T', { ID: 1 }, a => a.data)
stream.pipe(process.stdout)
```

```js
const stream = srv.stream('data').from('T', { ID: 1 })
stream.pipe(process.stdout)
```

```js
const stream = srv.stream('data').from('T').where({ ID: 1 })
stream.pipe(process.stdout)
```



### srv.stream  <i>  ([cqn](../cds/cqn)) &#8594; Promise \< [Readable Stream](https://nodejs.org/api/stream.html) \> </i>

This is a variant of `srv.stream`, which accepts a [`SELECT` query](../cds/cqn) as input and returns a Promise resolving to result stream when the query matched to an existing row in the database. The query is expected to select a single column and a single data row. Otherwise, an error is thrown.

```js
const stream = await srv.stream( SELECT('image').from('Foo',111) )
stream.pipe(process.stdout)
```



### srv.foreach  <i>  (entity | query, args?, callback) &#8594; Promise </i> { #srv-foreach}
[`srv.foreach`]: #srv-foreach


Executes the statement and processes the result set row by row. Use this API instead of [`cds.run`](#srv-run) if you expect large result sets. Then they're processed in a streaming-like fashion instead of materializing the full result set in memory before processing.

_**Common Usages:**_

```js
cds.foreach (SELECT.from('Foo'), each => console.log(each))
cds.foreach ('Foo', each => console.log(each))
```
{.indent}

> As depicted in the second line, a plain entity name can be used for the `entity` argument in which case it's expanded to a `SELECT * from ...`.
