---
label: Middlewares
synopsis: >
   Learn about default middlewares and all the options of customization.
# layout: node-js
status: released
---

# Middlewares

{{$frontmatter?.synopsis}}

::: warning
Customization is a beta feature. Beta features aren't part of the officially delivered scope that SAP guarantees for future releases. For more information, see [Important Disclaimers and Legal Information](https://help.sap.com/viewer/disclaimer).
:::

<!--- % include links-for-node.md %} -->
<!--- % include _chapters toc="2,3" %} -->

## Configuration

To use [tracing](#tracing) and [customization](#customization), you can start the application with the middlewares profile from the command line using `--profile middlewares` or set `cds.requires.middlewares = true` within your project configuration.

::: tip
This configuration becomes the default with one of our upcoming releases.
:::

## Default Middlewares

### Before Middlewares

#### cds.context

This middleware initializes [cds.context](events#cds-context) and starts the continuation. It's required for every application.

#### Tracing

The tracing middleware allows you to do a first-level performance analysis. It logs how much time is spent on which layer of the framework when serving a request.
To enable this middleware, you can set for example the [environment variable](cds-log#debug-env-variable) `DEBUG=trace`.

[Learn more about needed configuration.](#configuration){.learn-more}

#### Authentication

[By configuring an authentication strategy](./authentication#strategies), a middleware is mounted that fulfills the configured strategy.

#### cds.context.user / cds.context.tenant

This middleware adds user and tenant identified by authentication middleware to cds.context.

#### cds.context.model

It adds the currently active model to the continuation. It's required for all applications using extensibility or feature toggles.

#### Default Order

By default, the middlewares are executed in the following order:

```js
cds.middlewares.before = [
  context(),  // provides cds.context
  trace(),    // provides detailed trace logs when DEBUG=trace
  auth(),     // provides req.user & tenant
  ctx_auth(),  // propagates auth results to cds.context
  ctx_model(),    // fills in cds.context.model
]
```

::: warning _Be aware of the interdependencies of middlewares_ <!--  -->
_ctx_model_ requires that _cds.context_ middleware has run before.
_ctx_auth_ requires that _authentication_ has run before.
:::

<div id="beforecustomization" />

## Customization

The configuration of middlewares must be done programmatically before bootstrapping the CDS services, for example, in a [custom server.js](cds-serve#custom-server-js).

[Learn more about the `.add` method to register additional middleware.](/node.js/cds-serve#add-mw-pos){.learn-more}

### Basics

The framework exports the default middlewares itself and the list of middlewares which run before the protocol adapter starts processing the request.

```js
cds.middlewares = {
  auth,
  context,
  ctx_auth,
  ctx_model,
  errors,
  trace,
  before = [
    context(),
    trace(),
    auth(),
    ctx_auth(),
    ctx_model()
  ]
}
```

In order to plug in custom middlewares, you can override the complete list of middlewares or extend the list programmatically.
::: warning
Be aware that overriding requires constant updates as new middlewares by the framework are not automatically taken over.
:::

[Learn more about the middlewares Default Order.](#default-order){.learn-more}

### Customization of `req.user`

You can register middlewares to customize `req.user`.
It must be set after authentication but before `cds.context` is initialized.

```js
cds.middlewares.before = [
  cds.middlewares.context(),
  cds.middlewares.trace(),
  cds.middlewares.auth(),
  function req_user (req,res,next) {
    req.user.id = '<my-idp>' + req.user.id
    next()
  },
  cds.middlewares.ctx_auth()
]
```

### Enabling Feature Flags


```js
cds.middlewares.before = [
  cds.middlewares.context(),
  cds.middlewares.trace(),
  cds.middlewares.auth(),
  cds.middlewares.ctx_auth(),
  function req_features (req,res,next) {
    req.features = ['<feature-1>', '<feature-2>']
    next()
  },
  cds.middlewares.ctx_model()
]
```

[Learn more about Feature Vector Providers.](../guides/extensibility/feature-toggles#feature-vector-providers){.learn-more}

## Current Limitations

- Configuration of middlewares must be done programmatically.
