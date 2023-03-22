---
label: Application Services
synopsis: >
  Class `cds.ApplicationService` is the default service provider implementation, adding generic handlers as introduced in the Cookbook guides on [Providing Services], [Localized Data] and [Temporal Data].
layout: node-js
status: released
---

# Application Service Providers

{{ $frontmatter.synopsis }} 


## cds.**ApplicationService** <i> class </i> {: #cds-app-service}

### class cds.**ApplicationService** <i> extends cds.Service </i>

## Localized Messages / i18n {:#i18n}

### Generic Errors

You can provide localized error messages for a [growing number of runtime errors](#list-of-generic-texts). To do so, they simply need to provide `messages_<locale>.properties` files into one of the valid, model-unrelated text bundles folders. That is, as these texts aren’t model related, the properties files are only searched for in the folders listed in `cds.env.i18n.folders` and not next to any model. The first matching file is used. See [Where to Place Text Bundles?](../../guides/i18n#where-to-place-text-bundles) for more details.

Example:

```js
// i18n/messages_en.properties
MULTIPLE_ERRORS=Multiple errors occurred.

[...]

// i18n/messages_de.properties
MULTIPLE_ERRORS=Es sind mehrere Fehler aufgetreten.

[...]
```
{: style="padding: 0 33px"}


### Custom Errors

You can define custom texts (incl. placeholders) and use them in the message API [`req.reject/error/info/warn(...)`](../events#cds-request). The respective text key is provided instead of the string message, and optional array of placeholder values are passed as the last parameter. Placeholder values can again be text keys in order to enable translatable text fragments.

Example:

```js
// i18n/messages_en.properties
ORDER_EXCEEDS_STOCK=The order of {0} books exceeds the stock by {1}

[...]

// srv/catalog-service.js
const cds = require('@sap/cds')

module.exports = (srv) => {
  const { Books, Orders } = srv.entities

  srv.before('CREATE', Orders, async (req) => {
    const book = await SELECT.one(Books).where({ ID: req.data.book_ID })
    if (book.stock < req.data.quantity) {
      req.reject(400, 'ORDER_EXCEEDS_STOCK', [req.data.quantity, req.data.quantity - book.stock])
    }
  })
}
```
{: style="padding: 0 33px"}


### List of Generic Texts

Find the current list of generic runtime texts:

```
400=Bad Request
401=Unauthorized
403=Forbidden
404=Not Found
405=Method Not Allowed
406=Not Acceptable
407=Proxy Authentication Required
408=Request Timeout
409=Conflict
410=Gone
411=Length Required
412=Precondition Failed
413=Payload Too Large
414=URI Too Long
415=Unsupported Media Type
416=Range Not Satisfiable
417=Expectation Failed
424=Failed Dependency
428=Precondition Required
429=Too Many Requests
431=Request Header Fields Too Large
451=Unavailable For Legal Reasons
500=Internal Server Error
501=The server does not support the functionality required to 
fulfill the request
502=Bad Gateway
503=Service Unavailable
504=Gateway Timeout

MULTIPLE_ERRORS=Multiple errors occurred. See the details 
for more information.
```


## Built-in Draft Support {:#draft}

Class `ApplicationService` provides built-in support for Fiori Draft, which add these additional CRUD events:

### <i> Draft-related Events </i>


| CRUD Operation        | Descriptiopn                                      |
|-----------------------|---------------------------------------------------|
| `NEW` _\<entity\>_    | To start a draft session with an empty entity     |
| `EDIT` _\<entity\>_   | To start a draft session on an existing entity    |
| `PATCH` _\<entity\>_   | To send changes during a draft session            |
| `SAVE` _\<entity\>_   | To finalize a draft session with applying changes |
| `CANCEL` _\<entity\>_ | To abort a draft session                          |


### <i> Draft-related Handlers </i>

You can add your validation logic in the before operation handler for the `CREATE` or `UPDATE` event (as in the case of nondraft implementations) or on the `SAVE` event (specific to drafts only):

```js
srv.after ('NEW','Books', ...)      // for newly created drafts
srv.after ('EDIT','Books', ...)     // for starting edit draft sessions
srv.before ('PATCH','Books', ...)   // for field-level validations during editing
srv.before ('CREATE','Books', ...)  // run before create
srv.before ('UPDATE','Books', ...)  // run before create
srv.before ('SAVE','Books', ...)    // run at final save only
```

These events get triggered during the draft edit session whenever the user tabs from one field to the next, and can be used to provide early feedback.


### <i> Draft API </i> {:#service-draft-api .impl.concept}
[Draft API]: #service-draft
[`srv.edit`]: #service-draft

The following methods are reserved for handling draft editing, which stores edit state on the server and allows interrupting edit sessions to continue later on from the same or a different client.

### srv.new <i> (entity) </i> &#8594; draft {: .impl.concept style="margin-bottom:0px;"}

### srv.edit <i> (entity, key, locked=true) </i> &#8594; draft {: .impl.concept style="margin-bottom:0px; margin-top:.3em;"}

### srv.patch <i> (entity, draft.id) </i> .with <i> (data) </i> {: .impl.concept style="margin-bottom:0px; margin-top:.3em;"}

### srv.cancel <i> (entity, draft.id) </i> {: .impl.concept style="margin-bottom:0px; margin-top:.3em;"}

### srv.save <i> (entity, draft.id) </i> &#8594; key {: .impl.concept style="margin-bottom:0px; margin-top:.3em;"}

These methods control the draft choreography as follows:

* `edit` starts a draft editing session on an existing entity
* `new` starts a draft editing session on a new entity
* `patch` sends individual field updates
* `cancel` aborts a draft session without saving
* `save` inserts or updates the edited data

In between `edit` / `new` and `save` the actual edited data is sent to the server via one or more `patch` requests to the draft entity, e.g:

```js
const draft = await cds.edit ('Books',111)
cds.patch ('Books',draft) .with ({stock:44})
cds.patch ('Books',draft) .with ({changedAt:Date.now()})
cds.save ('Books',draft)
```

::: tip
The `save` operation always triggers two events in the provider: the `'SAVE'` event to _prepare_ and a `CREATE` or `UPDATE` event as if the respective operation would have been invoked without a draft session.
:::

Validations can be put on the final `CREATE` or `UPDATE` event as in nondraft implementations or on `SAVE` event, which is specific to drafts only. In addition you can add field-level validations on the individual `PATCH` events, which come in during the draft session to provide early feedback:

```js
srv.before ('PATCH','Books', req => {
  // validations to run during editing
})
srv.before ('SAVE','Books', req => {
  // validations to run at final save only
})
```



{:.sub-section}

### srv.lock <i> (entity, key, timeout?) </i> &#8594;  lock {: .impl.concept style="margin-bottom:0px;"}

### srv.release <i> (lock.id) </i> {: .impl.concept style="margin-top:.3em;"}

These methods allow locking an entity for editing, mutually excluding others from interfering with edits, hence avoiding lost-update situations (pessimistically).


{:.sub-section}

## Programmatic Validation {: #cds-assert .impl.concept}

[assert]: #cds-assert
[`req.assert`]: #cds-assert

<!-- {% assign assert = '<span style="color:#088">assert</span> <span style="color:grey">(field)</span>' %} -->

```js
srv.before ('INSERT','Books', validateBook)
function validateBook (req) {
  const expect = req.assert
  expect('title').is.specified().maxLength(111)
  expect('author').exists()
  expect('changedAt').is.readOnly()
  expect('status').is.inRange (['new', 'old'])
  expect('string').matches (/pattern/)
}
```

### assert (field) .meets <i>(condition) </i> {:.impl.concept}

### assert (field) .equals <i>(value) </i> {:.impl.concept}

### assert (field) .is ... <i>(value) </i> {:.impl.concept}

### assert (field) .is.maxLength<i>(n) </i> {:.impl.concept}

### assert (field) .is.not ... <i>(value) </i> {:.impl.concept}

### assert (field) .is.kindOf <i>(type) </i> {:.impl.concept}

### assert (field) .is.specified<i>() </i> {:.impl.concept}

### assert (field) .is.readOnly<i>() </i> {:.impl.concept}

### assert (field) .is.inRange <i>(...) </i> {:.impl.concept}

### assert (field) .exists<i>() </i> {:.impl.concept}

### assert (field) .matches <i>(string | pattern) </i> {:.impl.concept}

### assert (field) .contains <i>(string | pattern) </i> {:.impl.concept}

### assert (field) .startsWith <i>(string | pattern) </i> {:.impl.concept}

### assert (field) .endsWith <i>(string | pattern) </i> {:.impl.concept}

### assert (field) .not ... {:.impl.concept}


## <i> More to Come... </i>

This documentation is not complete yet, or the APIs are not released for general availability.
There's more to come in this place in upcoming releases.