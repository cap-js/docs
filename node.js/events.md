---
shorty: <code>cds</code><i>.Event/Request
redirect_from:
  - node.js/requests
layout: node-js
status: released
---

# Events and Requests

<!--- {% assign ctx = '<span style="color:#800; font-weight:500">ctx</span>' %} -->
<!--- {% assign eve = '<span style="color:#800; font-weight:500">msg</span>' %} -->
<!--- {% assign req = '<span style="color:#800; font-weight:500">req</span>' %} -->

<!--- {% include links-for-node.md %} -->
<!--- {% include _chapters toc="2,3" %} -->

## Class cds.**EventContext**  {: #cds-event-context}

Class `cds.EventContext` represents the invocation context of incoming request and event messages, mostly `tenant`. It also serves as a base class for `cds.Event` and `cds.Request`.




### ctx.context <i> → cds.EventContext </i> {:#eve-context .impl.concept}

The current instance's root context; `this.context === this` if this is a root context.

[Learn more about root contexts in the **Transactions** guide](transactions){:.learn-more}

::: danger
IMPORTANT: this is not a stable API yet.
:::



### ctx.id <i> → string </i> {:#req-id }

<div class="indent" markdown="1">
A unique string used for request correlation.

For inbound HTTP requests the implementation fills it from these sources in order of precedence:
- `x-correlation-id` header
- `x-correlationid` header
- `x-request-id` header
- `x-vcap-request-id` header
- a newly created UUID

On outgoing HTTP messages it is propagated as `x-correlation-id` header.

For inbound [CloudEvents](https://cloudevents.io) messages it taken from [the `id` context property](https://github.com/cloudevents/spec/blob/v1.0.1/spec.md#id) and propagated to the same on ougoing CloudEvents messages.
</div>



### ctx.user <i> → [cds.User](authentication#cds-user) </i> {:#user }


The current user as identified and verified by the authentication strategy.{:.indent}s

[See reference docs for `cds.User`.](authentication#cds-user){:.learn-more .indent}



### ctx.tenant <i> → string </i> {:#tenant }

A unique string identifying the current tenant, or `undefined` if not run in multitenancy mode. In case of multitenant operation, this string is used for tenant isolation, for example as keys in the database connection pools.  {:.indent}



### ctx.locale <i> → string </i> {:#locale}

The current user's preferred locale, usually taken from HTTP Accept-Language header of incoming requests and resolve to [_normalized_](../guides/i18n/#normalized-locales) {:.indent}





### ctx.timestamp <i> → Date </i> {:#req-timestamp }

<div class="indent" markdown="1">
Returns a stable timestamp for the current request being processed.

The first invocation on a request or any nested request calls and returns the response of [`new Date()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date). Subsequent invocations return the formerly determined and pinned value.

The CAP framework uses that to fill in values for the CDS pseudo variable `$now`, with the guaranteed same timestamp value.

[Learn more in the **Managed Data** guide.](../guides/providing-services#managed-data){:.learn-more}
[Learn more on `Date` in the MDN docs.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date){:.learn-more}
</div>



### ctx.on <i> (event, handler) </i> {:#ctx-on }
[`req.on`]: #ctx-on

Use this method to register handlers, executed when the whole request is finished.

```js
req.on('succeeded', () => {...}) // request succeeded
req.on('failed', () => {...}) // request failed
req.on('done', () => {...}) // request succeeded/failed
```

Additionally, you can register a handler for `req.before('commit')` to perform some final actions, such as validity checks, bookkeeping, etc.

Example:
```js
srv.before('CREATE', Order, function(req) {
  req.before('commit', async function() {
    const { creditscore } = await SELECT.one.from(Customers)
      .where({ ID: req.data.customer_ID })
    if (creditscore < 42) throw new Error("We shouldn't make this sale")
  })
})
```
::: danger
A request has `succeeded` or `failed` only once the respective transaction was finally committed or rolled back. Hence, `succeeded` handlers can't veto the commit anymore. Even more, as the final `commit` or `rollback` already happened, they run outside framework-managed transaction boundaries.
:::

To veto requests, either use the `req.before('commit')` hook described above, or [service-level event handlers](services#event-handlers) as shown in the following example:

```js
const srv = await cds.connect.to('AdminService')
srv.after('UPDATE', 'Orders', function(data, req) {
  if ([...]) req.reject('Veto UPDATE Orders!')
})

const db = await cds.connect.to('db')
db.before('COMMIT', function(req) {
  if ([...]) req.reject('Veto entire transaction!')
})
```

To do something which requires databases in `succeeded`/`failed` handlers, use `cds.spawn()`, or one of the other options of [manually-managed transactions](transactions).
::: warning
Errors thrown by the registered handlers are treated the same as any other error thrown during request processing. Hence, if you are doing something that should not result in an error being returned to the client, make sure to either start an asynchronous workflow via `cds.spawn()` or to wrap your code in a `try...catch` block.
:::

Additional note about OData: For requests that are part of a changeset, the events are emitted once the entire changeset was completed. Following the atomicity property ("all or nothing"), if at least one of the requests in the changeset fails, all requests fail.


## Class cds.**Event**  {: #cds-event}
[`cds.Event`]: #cds-event

Class `cds.Event` represents event messages in [asynchronous messaging](messaging), providing access to the [event name](#req-event), [target](#req-target), [payload data](#req-data), and [headers](#req-headers). It also serves as **the base class for [`cds.Request`](requests)** and hence for all synchronous interaction.




### <span style="color:#800; font-weight:500">msg</span>.event  <i>  &#8674; string </i> {:#req-event }

The name of the incoming event, which can be one of:

* The name of an incoming CRUD request like `CREATE`
* The name of an emitted CRUD event like `UPDATED`
* The name of a custom operation like `cancelOrder`.
  <!-- If the operation is not bound to an entity, it includes the service namespace like `bookshelf.CatalogService.cancelOrder`. -->
* The name of a custom event like `cancelledOrder`






### <span style="color:#800; font-weight:500">msg</span>.data  <i>  &#8674; {...} or [...] </i> {:#req-data }

Contains the request payload if `CREATE` and `UPDATE` requests, which can either be a single object or an array of objects in case of bulk operations (example: `await CatalogService.create('Books').entries([...])`).
<br/>
Contains the keys of the entity if `DELETE` and `READ` requests on a single entity through OData or REST.
<br/>
Contains parameters for functions and payload for actions.





### <span style="color:#800; font-weight:500">msg</span>.headers  <i>  &#8674; {...} </i> {:#req-headers }

Provides access to headers of the event message or request. In case of asynchronous event messages, it’s the headers information sent by the event source. If HTTP requests, it’s the [standard Node.js headers of class IncomingMessage](https://nodejs.org/api/http.html#http_message_headers).


<!--- Migrated: @external/node.js/cds.Request/61-cds.Request-.md -> @external/node.js/cds.request/cds.request-.md -->

{:.sub-section}

## Class cds.**Request** {: #cds-request}


Class `cds.Request` extends [`cds.Event`] with additional features to represent and deal with synchronous requests to services in [event handlers], such as the [query](#req-query), additional [request parameters](#req-params), the [authenticated user](#user), and [methods to send responses](#req-msg).


[Router]: http://expressjs.com/en/4x/api.html#router
[routing]: http://expressjs.com/en/guide/routing.html
[middleware]: http://expressjs.com/en/guide/using-middleware.html




### req._  <i>  &#8674; {...} </i> {:#req_}

Provides access to original inbound protocol-specific request objects. For events triggered by an HTTP request, it contains the original `req` and `res` objects as obtained from [express.js](http://expressjs.com). {:.indent}

::: warning
Please refrain from using internal properties of that object, i.e. the ones starting with '_'. They might be removed in any future release without notice.
:::




### req.method  <i>  &#8674; string </i> {:#req-method }

The HTTP method of the incoming request:

| `msg.event` | &rarr; | `msg.method` |
|-------------|--------|--------------|
| CREATE      | &rarr; | POST         |
| READ        | &rarr; | GET          |
| UPDATE      | &rarr; | PATCH        |
| DELETE      | &rarr; | DELETE       |

{:style="font-style:italic;width:auto;"}



### req.target  <i>  &#8674; [def] </i> {:#req-target }

Refers to the current request's target entity definition, if any; `undefined` for unbound actions/functions and events. The returned definition is a [linked](cds-reflect#cds-reflect) definition as reflected from the [CSN](../cds/csn) model.

In case of OData navigation requests along associations, `msg.target` refers to the last target.
For example:

| OData Request     | `req.target`         |
|-------------------|----------------------|
| Books             | AdminService.Books   |
| Books/201/author  | AdminService.Authors |
| Books(201)/author | AdminService.Authors |

{:style="font-style:italic;width:80%;"}

[See also `req.path` to learn how to access full navigation paths.](#req-path){:.learn-more}
[See _Entity Definitions_ in the CSN reference.](../cds/csn#entity-definitions){:.learn-more}
[Learn more about linked models and definitions.](cds-reflect#cds-reflect){:.learn-more}



### req.path  <i>  &#8674; string </i> {:#req-path}

Captures the full canonicalized path information of incoming requests with navigation.
If requests without navigation, `req.path` is identical to [`req.target.name`](#req-target) (or [`req.entity`](#req-entity), which is a shortcut for that).

Examples based on [cap/samples/bookshop AdminService](https://github.com/sap-samples/cloud-cap-samples/tree/master/bookshop/srv/admin-service.cds):

| OData Request     | `req.path`                | `req.target.name`    |
|-------------------|---------------------------|----------------------|
| Books             | AdminService.Books        | AdminService.Books   |
| Books/201/author  | AdminService.Books/author | AdminService.Authors |
| Books(201)/author | AdminService.Books/author | AdminService.Authors |
{:style="font-style:italic"}

[See also `req.target`](#req-target){:.learn-more}




### req.entity  <i>  &#8674; string </i> {:#req-entity}

This is a convenience shortcut to [`msg.target.name`](#req-target).




### req.params  <i>  &#8674; iterable </i> {:#req-params }

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






### req.query  <i>  &#8674; [cqn](../cds/cqn) </i> {:#req-query }

Captures the incoming request as a [CQN](../cds/cqn) query object. For example, an HTTP request like `GET http://.../Books` would be captured as follows:
```js
req.query = {SELECT:{from:{ref:['Books']}}}
```

If bound custom operations `req.query` contains the query to the entity, on which the bound custom operation is called. For unbound custom operations `req.query` contains an empty object.

### req.subject  <i>  &#8674; [ref](../cds/cxn#references) </i> {:#req-subject }

Acts as a pointer to one or more instances targeted by the request.
It can be used as input for [cds.ql](cds-ql) as follows:

```js
SELECT.one.from(req.subject)   //> returns single object
SELECT.from(req.subject)      //> returns one or many in array
UPDATE(req.subject)          //> updates one or many
DELETE(req.subject)         //> deletes one or many
```

It's available for CRUD events and bound actions.



### req.reply  <i>  (results) </i> {:#req-reply }
[`req.reply`]: #req-reply

Stores the given `results` in `req.results`, which will then be sent back to the client, rendered in a protocol-specific way.



### req.reject  <i>  (code?, msg, target?, args?) </i> {:#req-reject }
[`req.reject`]: #req-reject

Rejects the request with the given HTTP response code and single message. Additionally, `req.reject` throws an error based on the passed arguments. Hence, no additional code and handlers will be executed once `req.reject` has been invoked.

[Arguments are the same as for `req.error`](#req-msg){:.learn-more}




### req.error, notify, info, warn  <i>  (code?, message, target?, args?) </i> {:#req-msg }
[`req.info`]: #req-msg
[`req.error`]: #req-msg

Use these methods to collect messages or errors and return them in the request response to the caller. The method variants reflect different severity levels, use them as follows:

####  <i>  Variants </i>

| Method       | Collected in   | Typical UI | Severity |
|--------------|----------------|------------|:--------:|
| `req.notify` | `req.messages` | Toasters   | 1        |
| `req.info`   | `req.messages` | Dialog     | 2        |
| `req.warn`   | `req.messages` | Dialog     | 3        |
| `req.error`  | `req.errors`   | Dialog     | 4        |

{:style="font-style:italic;width:80%;"}

**Note:** messages with a severity less than 4 are collected and accessible in property `req.messages`, while error messages are collected in property `req.errors`. The latter allows to easily check, whether errors occurred with:

```js
if (req.errors) //> get out somehow...
```


####  <i>  Arguments </i>

- `code` _Number (Optional)_ - Represents the error code associated with the message. If the number is in the range of HTTP status codes and the error has a severity of 4, this argument sets the HTTP response status code.
- `message` _String \| Object \| Error_ - See below for details on the non-string version.
- `target` _String (Optional)_ - The name of an input field/element a message is related to.
- `args` _Array (Optional)_ - Array of placeholder values. See [Localized Messages](app-services#i18n) for details.

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

Additional properties can be added as well, for example to be used in [custom error handlers](services#srv-on-error).

> In OData responses, notifications get collected and put into HTTP response header `sap-messages` as a stringified array, while the others are collected in the respective response body properties (&rarr; see [OData Error Responses](http://docs.oasis-open.org/odata/odata-json-format/v4.0/os/odata-json-format-v4.0-os.html#_Toc372793091)).

####  <i>  Error Sanitization </i>

In production, errors should never disclose any internal information that could be used by malicious actors. Hence, we sanitize all server-side errors thrown by CAP framework. That is, all errors with a 5xx status code (the default status code is 500) are returned to the client with only the respective generic message (example: `500 Internal Server Error`). Errors defined by app developers are not sanitized and returned to the client unchanged.

Additionally, the OData protocol specifies which properties an error object may have. If a custom property shall reach the client, it must be prefixed with `@` in order to not be purged.



{:.sub-section}

### req.diff  <i>  (data?) </i> {:#req-diff .impl.beta}
[`req.diff`]: #req-diff

Use this asynchronous method to calculate the difference between the data on the database and the passed data (defaults to `req.data`, if not passed).
> This will trigger database requests.

```js
const diff = await req.diff()
```

