---
layout: node-js
shorty: cds.serve/r
redirect_from: node.js/cds-server
status: released
---

# Bootstrapping Servers and Service Providers

A Node.js CAP server process is started with the `cds serve` CLI command,
with `cds run` and `cds watch` as convenience variants.

Besides, handling command line arguments and adding log output, `cds serve` essentially loads a [built-in `server.js` module](#built-in-server-js), which can be accessed through `cds.server`.

You can plug-in custom logic to the default bootstrapping choreography using a [custom `server.js`](#custom-server-js)in your project.

<!-- [express.js app]: //node.js/cds-facade#cds-app -->



<!--- {% include links-for-node.md %} -->
<!--- {% include _toc levels="2,3" %} -->



## cds serve  <i>  command line </i>

By default, bootstrapping of servers is handled by the framework automatically. So, you only need `cds.serve` if you want to control the bootstrapping yourself, for example, in a custom [express `server.js`](cds-server).

## cds.server  <i>  &#8674; (options) => {...} </i> {:#cds-server }

<!--- {% assign on = '<i>&nbsp;&#8627;&nbsp;</i> .on <code>' %} -->
<!--- {% assign once = '<i>&nbsp;&#8627;&nbsp;</i> .once <code>' %} -->


This is essentially a shortcut getter to `require('@sap/cds/server')`, that is, it loads and returns
the [built-in `server.js`](#built-in-server-js) implementation.
You'd mainly use this in [custom `server.js`](#custom-server-js) to delegate to the default implementation, as shown below.




###  <i>  Built-in `server.js` </i> {:#built-in-server-js}

The built-in `server.js` constructs an [express.js app](cds-facade#cds-app), and bootstraps all CAP services using [`cds.connect`](cds-connect) and [`cds.serve`](cds-serve).
Its implementation essentially is as follows:

```js
const cds = require('@sap/cds')
const express = require('express')
module.exports = async function cds_server (options) {

  const _in_prod = process.env.NODE_ENV === 'production'
  const o = { ...options, __proto__:defaults }

  const app = cds.app = o.app || express()
  app.serve = _app_serve                          //> app.serve allows delegating to sub modules
  cds.emit ('bootstrap',app)                      //> hook for project-local server.js

  // mount static resources and logger middleware
  if (o.cors)      !_in_prod && app.use (o.cors)        //> CORS
  if (o.static)    app.use (express_static (o.static))  //> defaults to ./app
  if (o.favicon)   app.use ('/favicon.ico', o.favicon)  //> if none in ./app
  if (o.index)     app.get ('/',o.index)                //> if none in ./app
  if (o.correlate) app.use (o.correlate)                //> request correlation

  // load specified models or all in project
  const csn = await cds.load(o.from||'*',o) .then (cds.minify) //> separate csn for _init_db
  cds.model = cds.compile.for.nodejs(csn)

  // connect to essential framework services if required
  if (cds.requires.db)    cds.db = await cds.connect.to ('db') .then (_init)
  if (cds.requires.messaging)      await cds.connect.to ('messaging')

  // serve all services declared in models
  await cds.serve (o.service,o) .in (app)
  await cds.emit ('served', cds.services) //> hook for listeners

  // start http server
  const port = (o.port !== undefined) ? o.port : (process.env.PORT || cds.env.server?.port || 4004)
  return app.listen (port)
}
```


###  <i>  Custom `server.js` </i> {:#custom-server-js}

The CLI command `cds serve` optionally bootstraps from project-local `./server.js` or  `./srv/server.js`.
In there, register own handlers to bootstrap events emitted to [the `cds` facade object](cds-facade) as below:

```js
const cds = require('@sap/cds')
// react on bootstrapping events...
cds.on('bootstrap', ...)
cds.on('served', ...)
```

Provide an own bootstrapping function if you want to access and process the command line options.
This also allows you to override certain options before delegating to the built-in server.js.
In the example below, we construct the express.js app ourselves and fix the models to be loaded.

```js
const cds = require('@sap/cds')
// react on bootstrapping events...
cds.on('bootstrap', ...)
cds.on('served', ...)
// handle and override options
module.exports = (o)=>{
  o.from = 'srv/precompiled-csn.json'
  o.app = require('express')()
  return cds.server(o) //> delegate to default server.js
}
```

::: tip
The `req` object in your express middleware is not the same as `req` in your CDS event handlers.
::: 


    
### cds.once  <i>  ('**bootstrap**', ([express.js app](cds-facade#cds-app))=>{}) </i> 

A one-time event, emitted immediately after the [express.js app](cds-facade#cds-app)
has been created and before any middleware or CDS services are added to it.

```js
const cds = require('@sap/cds')
const express = require('express')
cds.on('bootstrap', (app)=>{
  // add your own middleware before any by cds are added

  // for example, serve static resources incl. index.html
  app.use(express.static(__dirname+'/srv/public'))
})
```


### cds.on  <i>  ('**loaded**', ([csn](../cds/csn))=>{}) </i> 

Emitted whenever a CDS model got loaded using `cds.load()`
    


### cds.on  <i>  ('**connect**', ([service](../cds/cdl#services))=>{}) </i> 

Emitted for each service constructed through [`cds.connect`](cds-connect).
    

    
### cds.on  <i>  ('**serving**', ([service](../cds/cdl#services))=>{}) </i> 

Emitted for each service constructed by [`cds.serve`](cds-serve).
    


### cds.once  <i>  ('**served**', ([services](../guides/providing-services/))=>{}) </i> 

A one-time event, emitted when all services have been bootstrapped and added to the [express.js app](cds-facade#cds-app).

```js
const cds = require('@sap/cds')
cds.on('served', (services)=>{
  // We can savely access service instances through the provided argument:
  const { CatalogService, db } = services
  // ...
})
```
    

### cds.once  <i>  ('**listening**', ({server,url})=>{}) </i> 

A one-time event, emitted when the server has been started and is listening to incoming requests.

### cds.once  <i>  ('**shutdown**', ()=>{}) </i> {: .impl.beta}

A one-time event, emitted when the server is closed and/or the process finishes.  Listeners can execute cleanup tasks.



## cds.serve... <i> &#8594; [service](../cds/cdl#services)\(s\) </i> {:#cds-serve}
<!-- [`cds.serve`](cds-serve): #cds-serve -->

Use `cds.serve()` to construct service providers from the service definitions in corresponding CDS models. As stated above, this is usually [done automatically by the built-in `cds.server`](#built-in-server-js).

### cds.serve <i> (service, options) &#8674; fluent api... </i>

Initiates a fluent API chain to construct service providers; use the methods documented below to add more options.


##### Common Usages:

```js
const { CatalogService } = await cds.serve ('my-services')
```
<!-- {:style='padding: 0 33px'} -->

```js
const app = require('express')()
cds.serve('all') .in (app)
```
<!-- {:style='padding: 0 33px'} -->



##### Arguments:

* `name` specifies which service to construct a provider for; use `all` to construct providers for all definitions found in the models.

```js
cds.serve('CatalogService')  //> serve a single service
cds.serve('all')             //> serve all services found
```

You may alternatively specify a string starting with `'./'` or refer to a file name with a non-identifier character in it, like `'-'` below, as a convenient shortcut to serve all services from that model:
```js
cds.serve('./reviews-service')  //> is not an identifier through './'
cds.serve('reviews-service')    //> same as '-', hence both act as:
cds.serve('all').from('./reviews-service')
```

The method returns a fluent API object, which is also a _Promise_ resolving to either an object with `'all'` constructed service providers, or to the single one created in case you specified a single service:

```js
const { CatalogService, AdminService } = await cds.serve('all')
const ReviewsService = await cds.serve('ReviewsService')
```


##### Caching:

The constructed service providers are cached in [`cds.services`](cds-facade#cds-services), which (a) makes them accessible to [`cds.connect`](cds-connect), as well as (b) allows us to extend already constructed services through subsequent invocation of [`cds.serve`](cds-serve).


##### Common Usages and Defaults

Most commonly, you'd use `cds.serve` in a custom file to add all the services to your [express.js](https://expressjs.com) app as follows:

```js
const app = require('express')()
cds.serve('all').in(app)
app.listen()
```

This uses these defaults for all options:

| Option | Description | Default |
| ------ | ----------- | ------- |
| cds.serve ... | which services to construct |  `'all'` services
| <i>&#8627;</i>.from  | models to load definitions from | `'./srv'` folder
| <i>&#8627;</i>.in  | express app to mount to | --- none ---
| <i>&#8627;</i>.to  | client protocol to serve to | `'fiori'`
| <i>&#8627;</i>.at  | endpoint path to serve at | `@path` or `.name`
| <i>&#8627;</i>.with  | implementation function | `@impl` or `._source`.js

Alternatively you can construct services individually, also from other models, and also mount them yourself, as document in the subsequent sections on individual fluent API options.

If you just want to add some additional middleware, it's recommended to bootstrap from a [custom `server.js`](cds-server).




### <i>&#8627;</i>.from <i> (model) </i> {:#from }

Allows to determine the CDS models to fetch service definitions from, which can be specified as one of:

- A filename of a single model, which gets loaded and parsed with [`cds.load`]
- A name of a folder containing several models, also loaded with [`cds.load`]
- The string `'all'` as a shortcut for all models in the `'./srv'` folder
- An already parsed model in [CSN](../cds/csn) format

The latter allows you to [`cds.load`] or dynamically construct models yourself and pass in the [CSN](../cds/csn) models, as in this example:

```js
const csn = await cds.load('my-services.cds')
cds.serve('all').from(csn)...
```

**If omitted**, `'./srv'` is used as default.



### <i>&#8627;</i>.to <i> (protocol) </i> {:#to }

Allows to specify the protocol through which to expose the service. Currently supported values are:

* `'rest'` plain http rest protocol without any OData-specific extensions
* `'odata'` standard OData rest protocol without any Fiori-specific extensions
* `'fiori'` OData protocol with all Fiori-specific extensions like Draft enabled

**If omitted**, `'fiori'` is used as default.



### <i>&#8627;</i>.at <i> (path) </i> {:#at }

Allows to programmatically specify the mount point for the service.

**Note** that this is only possible when constructing single services:
```js
cds.serve('CatalogService').at('/cat')
cds.serve('all').at('/cat') //> error
```

**If omitted**, the mount point is determined from [annotation `@path`](services#srv-path), if present, or from the service's lowercase name, excluding trailing _Service_.

```cds
service MyService @(path:'/cat'){...}  //> served at: /cat
service CatalogService {...}           //> served at: /catalog
```


### <i>&#8627;</i>.in <i> ([express app](https://expressjs.com/api.html#app)) </i> {:#in }

Adds all service providers as routers to the given [express app](https://expressjs.com/api.html#app).

```js
const app = require('express')()
cds.serve('all').in(app)
app.listen()
```

<!---
As all constructed services implement the [express.js middleware](http://expressjs.com/guide/using-middleware.html) protocol, you can alternatively mount them to your [express app] yourself. for example, as in this example:

```js
const app = require('express')()
const { CatalogService, AdminService } = await cds.serve('all')
app.use ('/cats', CatalogService)
app.use ('/admin', AdminService)
app.listen()
```

**If omitted**, the  providers are constructed but not mounted to server endpoints.
--->


### <i>&#8627;</i>.with <i> (impl function) </i> {:#with }

Allows to specify a function that adds [event handlers] to the service provider, either as a function or as a string referring to a separate node module containing the function.

```js
cds.serve('./srv/cat-service.cds') .with ('./srv/cat-service.js')
```

```js
cds.serve('./srv/cat-service') .with (srv => {
  srv.on ('READ','Books', (req) => req.reply([...]))
})
```

[Learn more about using impl annotations.](services#srv-impl){:.learn-more}
[Learn more about adding event handlers.](services#event-handlers){:.learn-more}


**Note** that this is only possible when constructing single services:
```js
cds.serve('CatalogService') .with (srv=>{...})
cds.serve('all') .with (srv=>{...})  //> error
```

**If omitted**, an implementation is resolved from annotation `@impl`, if present, or from a `.js` file with the same basename than the CDS model, for example:

```cds
service MyService @(impl:'cat-service.js'){...}
```

```bash
srv/cat-service.cds  #> CDS model with service definition
srv/cat-service.js   #> service implementation used by default
```

