---
status: released
---

# Localization / i18n

[[toc]]

## Introduction

The `cds.i18n` module supports internationalization features. In CAP these are used automatically behind the scenes for both, localisation of UIs, i.e. labels or headers, as well as localised error messages returned in responses to requests from UIs. In addition, you can use these features in your application-specific custom code.

There are two standard i18n bundles available through these static properties:

- [`cds.i18n.labels`](#labels) are used for generating localised UIs.
- [`cds.i18n.messages`](#messages) are used for error messages generated at runtime.

#### Localized UIs

The former is used automatically when generating OData `$metadata` documents for Fiori elements to lookup translations for respective [`{i18n>...}` placeholders](../guides/i18n#externalizing-texts-bundles). For example, localized texts for annotations like that will be looked up from `cds.i18n.labels`:

::: code-group

```cds [app/fiori-annotations.cds]
annotate CatalogService.Books with @title: '{i18n>Book}'
```

:::



#### Localized Messages

The latter is used automatically for all error or notification messages created through [`req.reject/error/info/warn(...)`](./events#req-reject), which includes all framework-created error messages, like input validation errors, as well as custom errors. For example you could add a new entry to the `_i18n/messages.properties`:

::: code-group
```properties [_i18n/messages.properties]
ORDER_EXCEEDS_STOCK = The order of {quantity} books exceeds available stock {stock}
```
:::

... and refer to that by key in your error messages like that:

::: code-group

 ```js [srv/cat-service.js]
 srv.before ('submitOrder', async req => {
   let { book:id, quantity } = req.data
   let {stock} = await SELECT `stock` .from (Books,id)
   if (stock < quantity)
     req.reject (409, 'ORDER_EXCEEDS_STOCK', { stock, quantity })
 })
 ```

:::



#### Direct Usage of `cds.i18n`

In addition, you can also use `cds.i18n` explicitly like that:

```js
cds.i18n.labels.at('CreatedAt','de')  //> 'Erstellt am'
cds.i18n.labels.at('CreatedAt')       //> 'Created At'
cds.i18n.messages.at('ASSERT_FORMAT', [11,12])
```

You can also introduce and use new bundles:

```js
const b = cds.i18n.bundle4('your-bundle')
b.at('some key')
```

And provide texts and translations in corresponding files like `_i18n/your-bundle.properties`.






## `cds.i18n` {.property}

This is a global object acting as the facade to the i18n features as outlined below.



### `.messages` {.property}

Provides access to the I18n bundle used for runtime messages, e.g. for translated validation errors, such as `ASSERT_RANGE` or `ASSERT_FORMAT`. Translations are loaded from properties with base name `messages`, like that in *[cap/sflight](https://github.com/sap-samples/cap-sflight/tree/main/_i18n)*: {.indent}

```zsh
cap/sflight/
├─ _i18n/
│  ├─ messages_de.properties
│  ├─ messages_en.properties
│  └─ messages_fr.properties
│  ...
```

[See also the list of pre-defined message texts below](#messages-texts){.learn-more}



### `.labels` {.property}

Provides access to the I18n bundle used for UI labels, such as `CreatedAt` or `CreatedBy`, referenced from respective [Fiori annotations](../guides/i18n#externalizing-texts-bundles). Translations are loaded from properties with base name `i18n`, like that in *[cap/sflight](https://github.com/sap-samples/cap-sflight/tree/main/_i18n)*: {.indent}

```zsh
cap/sflight/
├─ _i18n/
│  ├─ i18n_de.properties
│  ├─ i18n_en.properties
│  ├─ i18n_fr.properties
│  └─ i18n.properties
│  ...
```





### `.Bundle` {.property}

Facade property providing access to the [`I18nBundle`](#i18nbundle) class. While you should prefer usiing the [`i18n.bundle4()`](#bundle4) factory method to create bundles, you can use this to create own subclasses of `I18nBundle`, like this: {.indent}

```js
class My18nBundle extends cds.i18n.Bundle {...}
```





### `bundle4()` {.method}

```tsx
function cds.i18n.bundle4 (file : string, options?)
function cds.i18n.bundle4 (model : CSN, options?)
```

Factory method to create instances of  [`I18nBundle`](#i18nbundle). The first argument is either a string used as the bundle's basename (→ see [`i18n.file`](#file) below), or a CDS model.

```js
const b1 = cds.i18n.bundle4('foo')
```

```js
const mm = await cds.load('my-model.cds')
const b2 = cds.i18n.bundle4(mm)
```

When using the string variant, the created bundle is additionally cached under the given string in `cds.i18n.<file>`, and subsequent calls will return the cached instance:

```js
const b1 = cds.i18n.bundle4('foo') //> creates a new I18nBundle for 'foo'
const b2 = cds.i18n.bundle4('foo') //> returns the formerly created one
b1 === b2                          //> true
b1 === cds.i18n.foo                //> true
```





## `I18nBundle` {.class}

```tsx
class I18nBundle extends I18nResources {...}
```

Instances of this class provide access to translated texts in different languages.



### `.defaults` {.property}

Provides access to the default translations used as a first-level fallback if a locale-specific translation is not found. By default `en` is used as the default locale, which can be changed through config option <Config> cds.i18n.default_language </Config>. {.indent}



### `.fallback` {.property}

Provides access to the fallback translations used as a second-level fallback if a locale-specific translation is not found and also none in the [default translations](#defaults). {.indent}



### `at (key, ...)` {.method}

```tsx
function bundle.at (
   key: number|string|object,
   locale?: string,
   args?: object|array
) : string
```

This is the central method to lookup up localized texts for given keys and locales. Most commonly this method is used for runtime messages taken from the standard [`cds.i18n.messages`](#messages) bundle like that:

```js
cds.i18n.messages.at(404)       //> 'Not Found'
cds.i18n.messages.at(404,'de')  //> 'Nicht Gefunden'
```



#### Using Default Locales

If `locale` is omitted, the current default locale is taken from [`cds.context.locale`](events#cds-context).

```js
cds.context = {locale:'de'} //> as automatically set by protocol adapters
cds.i18n.messages.at(404)  //> 'Nicht Gefunden'
```



#### Parameterized Messages

If `args` are specified, corresponding `{}` placeholders in the translations are replaced by values. For example, given these entries in respective `.properties` files:

```properties
WRONG_FORMAT = '{0}' is not in format '{1}'
WRONG_RANGE = {val} is not in range {min}..{max}
```

You would obtain respective messages like that:

```js
const b = cds.i18n.messages
b.at('WRONG_FORMAT', ['foo','bar'])        //> 'foo' is not in format 'bar'
b.at('WRONG_RANGE', {val:0,min:1,max:11})  //> 0 is not in range 1..11
```



#### Looking up UI labels for CSN definitions

You can alternatively pass in a CSN definition instead of an i18n key to lookup the localized UI label for that an entity or element. For example, try this with `cds repl` from within the *[cap/sflight](../get-started/samples#sflight-fiori-app)* sample:

1. start `cds repl`
   ```sh
   cds repl
   ```

2. start the CAP server within the repl
   ```sh
   .run
   ```
3. lookup UI labels for CSN definitions
   ```js
   let {Travel} = TravelService.entities, {TotalPrice} = Travel.elements
   cds.context = {locale:'fr'}     // as automatically set by protocol adapters
   cds.i18n.labels.at(Travel)      //> 'Voyage'
   cds.i18n.labels.at(TotalPrice)  //> 'Prix total'
   ```

In essence, this would first lookup the value of the CSN definitions annotations `@Common.Label`, `@title`, or `@UI.HeaderInfo.TypeName`, extract the i18n key from that value's `{i18n>...}` content, and finally lookup the translated text with that key.



### `for (locale)` {.method}

```tsx
function bundle.for (locale: string) : Translations
```

This method is used internally by [`bundle.at()`](#at-key) to lazily load all translations for a locale.





## `I18nResources` {.class}

This is the base class of [`I18nBundle`](#i18nbundle) which provides all methods to fetch and load 18n [`.files`](#files).



### `constructor` {.method}

```tsx
function constructor (options: {
  file?: string,
  folders?: string[],
  roots?: string[],
  model?: CSN,
})
```



### `.file` {.property}

This is the base name for properties files to load translations from by this bundle. For example the basename of the [`cds.i18n.messages`](#messages) bundle is `'messages'`, the basename of the [`cds.i18n.labels`](#labels) bundle is `'i18n'`:
{.indent}

```js
cds.i18n.messages.file  //> 'messages'
cds.i18n.labels.file   //> 'i18n'
```



### `.files` {.property}

This is a getter which lazily fetches all files matching this bundle's [`.file` base name](#file) in all i18n [`.folders`](#folders). The value returned is a dictionary of files by folders like that in the *[cap/sflight](../get-started/samples#sflight-fiori-app)* sample: {.indent}

```js
cds.i18n.files  //> ...
{
  '/cap/sflight/node_modules/@sap/cds/_i18n': [
    'i18n.properties',
    'i18n_ar.properties',
    'i18n_bg.properties',
    'i18n_cs.properties',
    'i18n_da.properties',
    'i18n_de.properties',
    'i18n_en.properties',
    // ...
  ],
  '/cap/sflight/_i18n': [
    'i18n.properties',
    'i18n_de.properties',
    'i18n_en.properties',
    'i18n_fr.properties'
  ]
}
```





### `.folders` {.property}

The effective i18n folders from which this bundle will load files from. If not specified in the constructor, the getter lazily fetches all i18n [`.files`](#files)  in the neighborhood of the current default model's source files, with a result like this in the *[cap/sflight](../get-started/samples#sflight-fiori-app)* sample: {.indent}

An array of folder names to fetch i18n files from. By default this is filled from config option <Config keyOnly> cds.i18n.folders </Config>, which has these default values: {.indent}

```js
cds.i18n.folders //> ...
[
  '/cap/sflight/node_modules/@sap/cds/_i18n',
  '/cap/sflight/_i18n'
]
```





### `.sources` {.property}

An array of absolute directory names used as the starting point to fetch for i18n [`.folders`](#folders) and [`.files`](#files).  By default these are the directories of the current default model's sources files. For example given these model sources in the *[cap/sflight](../get-started/samples#sflight-fiori-app)* sample: {.indent}

```js
cds.model.$sources //> ...
[
  '/cap/sflight/app/value-helps.cds',
  '/cap/sflight/app/services.cds',
  '/cap/sflight/app/labels.cds',
  '/cap/sflight/app/common.cds',
  '/cap/sflight/app/travel_processor/layouts.cds',
  '/cap/sflight/app/travel_processor/field-control.cds',
  '/cap/sflight/app/travel_processor/capabilities.cds',
  '/cap/sflight/app/travel_analytics/annotations.cds',
  '/cap/sflight/srv/travel-service.cds',
  '/cap/sflight/srv/analytics-service.cds',
  '/cap/sflight/db/schema.cds',
  '/cap/sflight/db/master-data.cds',
  '/cap/sflight/db/common.cds',
  '/cap/sflight/node_modules/@sap/cds/common.cds'
]
```

... we would get these source directories:

```js
cds.i18n.sources //> ...
[
  '/cap/sflight/node_modules/@sap/cds',
  '/cap/sflight/db',
  '/cap/sflight/srv',
  '/cap/sflight/app/travel_analytics',
  '/cap/sflight/app/travel_processor',
  '/cap/sflight/app'
]
```

> Note: reverse order means: entries in `app`  override same entries in `db`, etc.



### `.roots` {.property}

An array of root directories up to which to recurse up the filesystem hierarchy when searching for i18n [`.folders`](#folders). The default is `[ cds.root ]`. {.indent}



## Messages Texts

These are the current i18n entries for [`cds.i18n.messages`](#messages) used by the CAP runtime, which you can provide own translations for in your app-specific `_i18n/messages_<locale>.properties` files:

```properties
MULTIPLE_ERRORS = Multiple errors occurred. Please see the details for more information.
ASSERT_FORMAT = Value "{0}" is not in specified format "{1}"
ASSERT_RANGE = Value {0} is not in specified range [{1}, {2}]
ASSERT_ENUM = Value {0} is invalid according to enum declaration {{1}}
ASSERT_NOT_NULL = Value is required
```

In addition the following HTTP status codes can be translated:

```properties
400 = Bad Request
401 = Unauthorized
403 = Forbidden
404 = Not Found
405 = Method Not Allowed
406 = Not Acceptable
407 = Proxy Authentication Required
408 = Request Timeout
409 = Conflict
410 = Gone
411 = Length Required
412 = Precondition Failed
413 = Payload Too Large
414 = URI Too Long
415 = Unsupported Media Type
416 = Range Not Satisfiable
417 = Expectation Failed
422 = Unprocessable Content
424 = Failed Dependency
428 = Precondition Required
429 = Too Many Requests
431 = Request Header Fields Too Large
451 = Unavailable For Legal Reasons
500 = Internal Server Error
501 = The server does not support the functionality required to fulfill the request
502 = Bad Gateway
503 = Service Unavailable
504 = Gateway Timeout
```
