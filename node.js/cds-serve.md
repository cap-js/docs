---
status: released
---



# Serving Provided Services



## Declaring Provided Services

## Implementing Services

## cds.serve... <i> &#8594; [service](../cds/cdl#services)\(s\) </i> {#cds-serve}

<!-- [`cds.serve`](cds-serve): #cds-serve -->

Use `cds.serve()` to construct service providers from the service definitions in corresponding CDS models. As stated above, this is usually [done automatically by the built-in `cds.server`](#built-in-server-js).

Declaration:

```ts:no-line-numbers
async function cds.serve (
  service        : 'all' | string | cds.Service | typeof cds.Service, 
  options        : { service = 'all', ... }
) .from ( model  : string | CSN )         // default: cds.model
  .to ( protocol : string | 'rest' | 'odata' | 'odata-v2' | 'odata-v4' | ... )
  .at ( path     : string )
  .in ( app      : express.Application )  // default: cds.app
.with ( impl     : string | function | cds.Service | typeof cds.Service )
```

### cds. services {.property}

All service instances constructed by `cds.connect()` or by `cds.serve()`are registered in the `cds.services` dictionary. After the bootstrapping phase you can safely refer to entries in there:

```js
const { CatalogService } = cds.services
```

Use this if you are not sure whether a service is already constructed:

```js
const CatalogService = await cds.connect.to('CatalogService')
```





### cds.serve <i> (service, options) &#8674; fluent api... </i>

Initiates a fluent API chain to construct service providers; use the methods documented below to add more options.


##### Common Usages:

```js
const { CatalogService } = await cds.serve ('my-services')
```
<!-- {style='padding: 0 33px'} -->

```js
const app = require('express')()
cds.serve('all') .in (app)
```
<!-- {style='padding: 0 33px'} -->



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

If you just want to add some additional middleware, it's recommended to bootstrap from a [custom `server.js`](#cds-server).




### <i>&#8627;</i>.from <i> (model) </i> {#from }

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



### <i>&#8627;</i>.to <i> (protocol) </i> {#to }

Allows to specify the protocol through which to expose the service. Currently supported values are:

* `'rest'` plain http rest protocol without any OData-specific extensions
* `'odata'` standard OData rest protocol without any Fiori-specific extensions
* `'fiori'` OData protocol with all Fiori-specific extensions like Draft enabled

**If omitted**, `'fiori'` is used as default.



### <i>&#8627;</i>.at <i> (path) </i> {#at }

Allows to programmatically specify the mount point for the service.

**Note** that this is only possible when constructing single services:
```js
cds.serve('CatalogService').at('/cat')
cds.serve('all').at('/cat') //> error
```

**If omitted**, the mount point is determined from annotation `@path`, if present, or from the service's lowercase name, excluding trailing _Service_.

```cds
service MyService @(path:'/cat'){...}  //> served at: /cat
service CatalogService {...}           //> served at: /catalog
```


### <i>&#8627;</i>.in <i> ([express app](https://expressjs.com/api.html#app)) </i> {#in }

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


### <i>&#8627;</i>.with <i> (impl function) </i> {#with }

Allows to specify a function that adds [event handlers] to the service provider, either as a function or as a string referring to a separate node module containing the function.

```js
cds.serve('./srv/cat-service.cds') .with ('./srv/cat-service.js')
```

```js
cds.serve('./srv/cat-service') .with (srv => {
  srv.on ('READ','Books', (req) => req.reply([...]))
})
```

[Learn more about using impl annotations.](core-services#implementing-services){.learn-more}
[Learn more about adding event handlers.](core-services#srv-on-before-after){.learn-more}


**Note** that this is only possible when constructing single services:
```js
cds.serve('CatalogService') .with (srv=>{...})
cds.serve('all') .with (srv=>{...})  //> error
```

**If omitted**, an implementation is resolved from annotation `@impl`, if present, or from a `.js` file with the same basename than the CDS model, for example:

```cds
service MyService @(impl:'cat-service.js'){...}
```

```sh
srv/cat-service.cds  #> CDS model with service definition
srv/cat-service.js   #> service implementation used by default
```



## cds. middlewares



### . context() {.method}

### . auth() {.method}

### . ctx_auth() {.method}

### . ctx_models() {.method}

### . trace() {.method}

### . error() {.method}





## cds. protocols
