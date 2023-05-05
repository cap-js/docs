# Localization / i18n

## 

### Generic Errors

You can provide localized error messages for a [growing number of runtime errors](#list-of-generic-texts). To do so, they simply need to provide `messages_<locale>.properties` files into one of the valid, model-unrelated text bundles folders. That is, as these texts aren’t model related, the properties files are only searched for in the folders listed in `cds.env.i18n.folders` and not next to any model. The first matching file is used. See [Where to Place Text Bundles?](../guides/i18n#where-to-place-text-bundles) for more details.

Example:

```js
// i18n/messages_en.properties
MULTIPLE_ERRORS=Multiple errors occurred.

[...]

// i18n/messages_de.properties
MULTIPLE_ERRORS=Es sind mehrere Fehler aufgetreten.

[...]
```

{ style="padding: 0 33px"}


### Custom Errors

You can define custom texts (incl. placeholders) and use them in the message API [`req.reject/error/info/warn(...)`](./events#cds-request). The respective text key is provided instead of the string message, and optional array of placeholder values are passed as the last parameter. Placeholder values can again be text keys in order to enable translatable text fragments.

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

{ style="padding: 0 33px"}


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

MULTIPLE_ERRORS=Multiple errors occurred. See the details for more information.
```

