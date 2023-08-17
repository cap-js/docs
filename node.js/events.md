---
redirect_from:
  - node.js/requests
status: released
---

# Events and Requests



[[toc]]



## cds. context {.property}

This property provides seemingly static access to the current  [`cds.EventContext`], that is the current `tenant`, `user` , `locale`, etc. from wherever you are in your code. For example:

```js
let { tenant, user } = cds.context
```

Usually that context is set by inbound middlewares.

The property is realised as a so-called continuation-local variable, implemented using [Node.js' async local storage](https://nodejs.org/api/async_context.html) technique, and a getter/setter pair: The getter is a shortcut for[`getStore()`](https://nodejs.org/api/async_context.html#asynclocalstoragegetstore). The setter coerces values into valid instances of [`cds.EventContext`]. For example:

```js
cds.context = { tenant:'t1', user:'u2' }
let ctx = cds.context
ctx instanceof cds.EventContext  //> true
ctx.user instanceof cds.User     //> true
ctx.tenant === 't1'              //> true
ctx.user.id === 'u2'             //> true
```

If a transaction object is assigned, it's `tx.context` will be used, hence `cds.context = tx` acts as a convenience shortcut for `cds.context = tx.context`:

```js
let tx = cds.context = cds.tx({ ... })
cds.context === tx.context  //> true
```

::: tip

Prefer local  `req`  objects in your handlers for accessing event context properties, as each access to `cds.context` happens through [`AsyncLocalStorage.getStore()`](https://nodejs.org/api/async_context.html#asynclocalstoragegetstore), which induces some minor overhead.

:::







## Class `cds.EventContext` { #cds-event-context }

[`cds.EventContext`]: #cds-event-context	"Class cds.EventContext"



Instances of this class represent the invocation context of incoming requests and event messages, such as `tenant`, `user` and `locale`. Classes [`cds.Event`] and [`cds.Request`] inherit from it and hence provide acccess to the event context properties:

```js
this.on ('*', req => {
  let { tenant, user } = req
  ...
})
```

In addition, you can access the current event context from wherever you are in your code via the continuation-local variable [`cds.context`](#cds-context):

```js
  let { tenant, user } = cds.context
```





### . http {.property}

If the inbound process came from an HTTP channel, this property provides access to express's common [`req`](https://expressjs.com/en/4x/api.html#req) and [`res`](https://expressjs.com/en/4x/api.html#res) objects. The property is propagated from `cds.context` to all child requests. So, on all handlers, even the ones in your database services, you can always access that property like so:

```js
this.on ('*', req => {
  let { res } = req.http
  res.send('Hello!')
})
```



### . id {.property}

A unique string used for request correlation.


For inbound HTTP requests the implementation fills it from these sources in order of precedence:

- `x-correlation-id` header
- `x-correlationid` header
- `x-request-id` header
- `x-vcap-request-id` header
- a newly created UUID

On outgoing HTTP messages it is propagated as `x-correlation-id` header.

For inbound [CloudEvents](https://cloudevents.io) messages it taken from [the `id` context property](https://github.com/cloudevents/spec/blob/v1.0.1/spec.md#id) and propagated to the same on outgoing CloudEvents messages.



### . locale {.property}

The current user's preferred locale, usually taken from HTTP Accept-Language header of incoming requests and resolve to [_normalized_](../guides/i18n#normalized-locales).






### . tenant {.property}

A unique string identifying the current tenant, or `undefined` if not in multitenancy mode. In case of multitenant operation, this string is used for tenant isolation, for example as keys in the database connection pools.



### . timestamp {.property}

A constant timestamp for the current request being processed,as an instance of [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date). The CAP framework uses that to fill in values for the CDS pseudo variable `$now`, with the guaranteed same value.

[Learn more in the **Managed Data** guide.](../guides/providing-services#managed-data){.learn-more}



### . user {.property}

The current user, an instance of `cds.User` as identified and verified by the authentication strategy. If no user is authenticated, `cds.User.anonymous` is returned.

[See reference docs for `cds.User`.](authentication#cds-user){.learn-more .indent}








## Class `cds.Event`  { #cds-event}
[`cds.Event`]: #cds-event	"Class cds.Event"



Class [`cds.Event`] represents event messages in [asynchronous messaging](messaging), providing access to the [event](#event) name, payload [data](#data), and optional [headers](#headers). It also serves as **the base class for [`cds.Request`](#cds-request)** and hence for all synchronous interactions.




### . event {.property}

The name of the incoming event, which can be one of:

* The name of an incoming CRUD request like `CREATE`, `READ`, `UPDATE`, `DELETE`
* The name of a custom action or function like `submitOrder`
* The name of a custom event like `OrderedBook`




### . data {.property}

Contains the event data. For example, the HTTP body for `CREATE` or `UPDATE` requests, or the payload of an asynchronous event message.



### . headers {.property}

Provides access to headers of the event message or request. In case of asynchronous event messages, it’s the headers information sent by the event source. For HTTP requests it’s the [standard Node.js request headers](https://nodejs.org/api/http.html#http_message_headers).





### eve. before 'commit' {.event}

### eve. on 'succeeded' {.event}

### eve. on 'failed' {.event}

### eve. on 'done' {.event}

Register handlers to these events on a per event / request basis. The events are executed when the whole top-level request handling is finished

Use this method to register handlers, executed when the whole request is finished.

```js
req.before('commit', () => {...}) // immediately before calling commit
req.on('succeeded', () => {...}) // request succeeded, after commit
req.on('failed', () => {...}) // request failed, after rollback
req.on('done', () => {...}) // request succeeded/failed, after all
```

::: danger
The events `succeeded` , `failed` and `done` are emitted *after* the current transaction ended. Hence, they **run outside framework-managed transactions**, and handlers can't veto the commit anymore.
:::



To veto requests, either use the `req.before('commit')` hook, or service-level `before` `COMMIT` handlers.

To do something which requires databases in `succeeded`/`failed` handlers, use `cds.spawn()`, or one of the other options of [manually-managed transactions](./cds-tx).

Additional note about OData: For requests that are part of a changeset, the events are emitted once the entire changeset was completed. If at least one of the requests in the changeset fails, following the atomicity property ("all or nothing"), all requests fail.





## Class `cds.Request` { #cds-request }

[`cds.Request`]: #cds-request	"Class cds.Request"



Class `cds.Request` extends [`cds.Event`] with additional features to represent and deal with synchronous requests to services in [event handlers](./core-services#srv-handle-event), such as the [query](#query), additional [request parameters](#params), the [authenticated user](#user), and [methods to send responses](#req-reply).


[Router]: https://expressjs.com/en/4x/api.html#router
[routing]: https://expressjs.com/en/guide/routing.html
[middleware]: https://expressjs.com/en/guide/using-middleware.html




### . _  {.property}

Provides access to original inbound protocol-specific request objects. For events triggered by an HTTP request, it contains the original `req` and `res` objects as obtained from [express.js](https://expressjs.com). {.indent}

::: warning
Please refrain from using internal properties of that object, that is the ones starting with '_'. They might be removed in any future release without notice.
:::




### . method {.property}

The HTTP method of the incoming request:

| `msg.event` | &rarr; | `msg.method` |
|-------------|--------|--------------|
| CREATE      | &rarr; | POST         |
| READ        | &rarr; | GET          |
| UPDATE      | &rarr; | PATCH        |
| DELETE      | &rarr; | DELETE       |

{style="font-style:italic;width:auto;"}



### . target {.property}

Refers to the current request's target entity definition, if any; `undefined` for unbound actions/functions and events. The returned definition is a [linked](cds-reflect#cds-reflect) definition as reflected from the [CSN](../cds/csn) model.

In case of OData navigation requests along associations, `msg.target` refers to the last target.
For example:

| OData Request     | `req.target`         |
|-------------------|----------------------|
| Books             | AdminService.Books   |
| Books/201/author  | AdminService.Authors |
| Books(201)/author | AdminService.Authors |

{style="font-style:italic;width:80%;"}

[See also `req.path` to learn how to access full navigation paths.](#path){.learn-more}
[See _Entity Definitions_ in the CSN reference.](../cds/csn#entity-definitions){.learn-more}
[Learn more about linked models and definitions.](cds-reflect#cds-reflect){.learn-more}



### . path {.property}

Captures the full canonicalized path information of incoming requests with navigation.
If requests without navigation, `req.path` is identical to [`req.target.name`](#target) (or [`req.entity`](#entity), which is a shortcut for that).

Examples based on [cap/samples/bookshop AdminService](https://github.com/sap-samples/cloud-cap-samples/tree/master/bookshop/srv/admin-service.cds):

| OData Request     | `req.path`                | `req.target.name`    |
|-------------------|---------------------------|----------------------|
| Books             | AdminService.Books        | AdminService.Books   |
| Books/201/author  | AdminService.Books/author | AdminService.Authors |
| Books(201)/author | AdminService.Books/author | AdminService.Authors |
{style="font-style:italic"}

[See also `req.target`](#target){.learn-more}




### . entity {.property}

This is a convenience shortcut to [`msg.target.name`](#target).




### . params {.property}

Provides access to parameters in URL paths as an [*iterable*](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) with the contents matching the positional occurrence of parameters in the url path. In case of compound parameters, the respective entry is the key value pairs as given in the URL.
<!-- If the respective resource has a single key predicate called `ID`, the value is returned directly. -->

For example, the parameters in an HTTP request like that:

```http
GET /catalog/Authors(101)/books(title='Eleonora',edition=2) HTTP/1.1
```

The provided parameters can be accessed as follows:

```js
const [ author, book ] = req.params
// > author === 101
// > book === { title: 'Eleonora', edition: 2 }
```






### . query {.property}

Captures the incoming request as a [CQN](../cds/cqn) query object. For example, an HTTP request like `GET http://.../Books` would be captured as follows:
```js
req.query = {SELECT:{from:{ref:['Books']}}}
```

If bound custom operations `req.query` contains the query to the entity, on which the bound custom operation is called. For unbound custom operations `req.query` contains an empty object.

### . subject {.property}

Acts as a pointer to one or more instances targeted by the request.
It can be used as input for [cds.ql](cds-ql) as follows:

```js
SELECT.one.from(req.subject)   //> returns single object
SELECT.from(req.subject)      //> returns one or many in array
UPDATE(req.subject)          //> updates one or many
DELETE(req.subject)         //> deletes one or many
```

It's available for CRUD events and bound actions.



### req. reply() {.method}
[`req.reply`]: #req-reply

Stores the given `results` in `req.results`, which will then be sent back to the client, rendered in a protocol-specific way.



### req. reject() {.method}
[`req.reject`]: #req-reject

Rejects the request with the given HTTP response code and single message. Additionally, `req.reject` throws an error based on the passed arguments. Hence, no additional code and handlers will be executed once `req.reject` has been invoked.

[Arguments are the same as for `req.error`](#req-error){.learn-more}




### req. error() {.method}
### req. warn() {.method}
### req. info() {.method}
### req. notify() {.method}

[`req.info`]: #req-msg
[`req.error`]: #req-msg

Use these methods to collect messages or errors and return them in the request response to the caller. The method variants reflect different severity levels, use them as follows:

####  <i>  Variants </i>

| Method         | Collected in   | Typical UI | Severity |
| -------------- | -------------- | ---------- | :------: |
| `req.notify()` | `req.messages` | Toasters   |    1     |
| `req.info()`   | `req.messages` | Dialog     |    2     |
| `req.warn()`   | `req.messages` | Dialog     |    3     |
| `req.error()`  | `req.errors`   | Dialog     |    4     |

{style="font-style:italic;width:80%;"}

**Note:** messages with a severity less than 4 are collected and accessible in property `req.messages`, while error messages are collected in property `req.errors`. The latter allows to easily check, whether errors occurred with:

```js
if (req.errors) //> get out somehow...
```


####  <i>  Arguments </i>

- `code` _Number (Optional)_ - Represents the error code associated with the message. If the number is in the range of HTTP status codes and the error has a severity of 4, this argument sets the HTTP response status code.
- `message` _String \| Object \| Error_ - See below for details on the non-string version.
- `target` _String (Optional)_ - The name of an input field/element a message is related to.
- `args` _Array (Optional)_ - Array of placeholder values. See [Localized Messages](cds-i18n) for details.

####  <i>  Using an Object as Argument </i>

You can also pass an object as the sole argument, which then contains the properties `code`, `message`, `target`, and `args`. Additional properties are preserved until the error or message is sanitized for the client. In case of an error, the additional property `status` can be used to specify the HTTP status code of the response.

```js
req.error ({
  code: 'Some-Custom-Code',
  message: 'Some Custom Error Message',
  target: 'some_field',
  status: 418
})
```

Additional properties can be added as well, for example to be used in [custom error handlers](core-services#srv-on-error).

> In OData responses, notifications get collected and put into HTTP response header `sap-messages` as a stringified array, while the others are collected in the respective response body properties (&rarr; see [OData Error Responses](https://docs.oasis-open.org/odata/odata-json-format/v4.0/os/odata-json-format-v4.0-os.html#_Toc372793091)).

####  <i>  Error Sanitization </i>

In production, errors should never disclose any internal information that could be used by malicious actors. Hence, we sanitize all server-side errors thrown by CAP framework. That is, all errors with a 5xx status code (the default status code is 500) are returned to the client with only the respective generic message (example: `500 Internal Server Error`). Errors defined by app developers are not sanitized and returned to the client unchanged.

Additionally, the OData protocol specifies which properties an error object may have. If a custom property shall reach the client, it must be prefixed with `@` in order to not be purged.


### req. diff() {.method}
[`req.diff`]: #req-diff

Use this asynchronous method to calculate the difference between the data on the database and the passed data (defaults to `req.data`, if not passed).
> This will trigger database requests.

```js
const diff = await req.diff()
```
