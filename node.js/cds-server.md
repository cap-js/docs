---
status: released
---



# Bootstrapping Servers





CAP Node.js servers a bootstrapped through a [built-in `server.js` module](#built-in-server-js), which can be accessed through [`cds.server`](#cds-server). You can plug-in custom logic to the default bootstrapping choreography using a [custom `server.js`](#custom-server-js) in your project.



[[toc]]



## CLI Command `cds serve`

A Node.js CAP server process is usually started with the `cds serve` CLI command,
with `cds run` and `cds watch` as convenience variants. 

**For deployment**, when the `@sap/cds-dk` package providing the `cds` CLI executable is not available, use the `cds-serve` binary provided by the `@sap/cds` package: 

```json
{
  "scripts": {
    "start": "cds-serve"
  }
}
```







##  Built-in `server.js`

The built-in `server.js` constructs an [express.js app](cds-facade#cds-app), and bootstraps all CAP services using [`cds.connect`](cds-connect) and [`cds.serve`](cds-serve).
Its implementation essentially is as follows:

```js
const cds = require('@sap/cds')
cds.server = module.exports = async function (options) {

  const app = cds.app = o.app || require('express')()
  cds.emit ('bootstrap', app)

  // load model from all sources
  const csn = await cds.load('*')
  cds.model = cds.compile.for.nodejs(csn)
  cds.emit ('loaded', cds.model)

  // connect to prominent required services
  if (cds.requires.db)  cds.db = await cds.connect.to ('db')
  if (cds.requires.messaging)    await cds.connect.to ('messaging')

  // serve own services as declared in model
  await cds.serve ('all') .from(csn) .in (app)
  await cds.emit ('served', cds.services)

  // launch http server
  cds .emit ('launching', app)
  const port = o.port ?? process.env.PORT || 4004
  const server = app.server = app.listen(port) .once ('listening', ()=>
    cds.emit('listening', { server, url: `http://localhost:${port}` })
  )
}
```



### cds. server() {.method}

This is essentially a shortcut getter to `require('@sap/cds/server')`, that is, it loads and returns
the [built-in `server.js`](#built-in-server-js) implementation.
You'd mainly use this in [custom `server.js`](#custom-server-js) to delegate to the default implementation, [as shown below](#override-cds-server).



### cds. app {.property}

The express.js `app` constructed by the server implementation.



##   Custom `server.js`

The CLI command `cds serve` optionally bootstraps from project-local `./server.js` or  `./srv/server.js`.

### Plug-in to Lifecycle Events

In custom `server.js`, you can plugin to all parts of `@sap/cds`.  Most commonly you'd register own handlers to lifecycle events emitted to [the `cds` facade object](cds-facade) as below:

```js
const cds = require('@sap/cds')
// react on bootstrapping events...
cds.on('bootstrap', ...)
cds.on('served', ...)
```

### Override `cds.server()`

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



## Lifecycle Events

### bootstrap {.event}

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


### loaded {.event}

Emitted whenever a CDS model got loaded using `cds.load()`



### connect {.event}

Emitted for each service constructed through [`cds.connect`](cds-connect).



### serving {.event}

Emitted for each service constructed by [`cds.serve`](cds-serve).



### served {.event}

A one-time event, emitted when all services have been bootstrapped and added to the [express.js app](cds-facade#cds-app).

```js
const cds = require('@sap/cds')
cds.on('served', (services)=>{
  // We can savely access service instances through the provided argument:
  const { CatalogService, db } = services
  // ...
})
```



### listening {.event}

A one-time event, emitted when the server has been started and is listening to incoming requests.



### shutdown {.event}

A one-time event, emitted when the server is closed and/or the process finishes.  Listeners can execute cleanup tasks.







## See Also...

The [`cds-plugin` package technique](cds-plugins) provides more options to customize server startup.