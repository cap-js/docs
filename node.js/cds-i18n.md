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

### Localized (Fiori) UIs

The former, that is [`cds.i18n.labels`](#labels), is used automatically when generating OData `$metadata` documents for Fiori elements to lookup translations for respective [`{i18n>...}` placeholders](../guides/i18n#externalizing-texts-bundles). For example, localized texts for annotations like that will be looked up from `cds.i18n.labels`:

::: code-group

```cds [app/fiori-annotations.cds]
annotate CatalogService.Books with @title: '{i18n>Book}'
```

:::



### Localized Messages

The latter, that is [`cds.i18n.messages`](#messages), is used automatically for all error or notification messages created through [`req.reject/error/info/warn(...)`](./events#req-reject), which includes all framework-created error messages, like input validation errors, as well as custom errors. For example you could add a new entry to the `_i18n/messages.properties`:

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



### Direct Usage of `cds.i18n`

In addition, you can also use both standard bundles directly in your code like that:

```js
cds.i18n.labels.at('CreatedAt','de')  //> 'Erstellt am'
cds.i18n.labels.at('CreatedAt')       //> 'Created At'
cds.i18n.messages.at('ASSERT_FORMAT', [11,12])
```

[Learn more about `bundle.at(key...)`, the central method to lookup localized texts](#at-key){.learn-more}

You can also introduce and use your own, separate bundles:

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

Facade property providing access to the [`I18nBundle`](#i18nbundle) class. While you should prefer using the [`i18n.bundle4()`](#bundle4) factory method to create bundles, you can use this to create own subclasses of `I18nBundle`, like this: {.indent}

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

Instances of this class provide access to translated texts in different languages. You can refer to this class from the [`cds.i18n.Bundle`](#bundle) facade property. 



### `constructor` {.method}

```tsx
function constructor (options: {
  default_language?: string,
  defaults?: { [string]: [string] },
  fallback?: { [string]: [string] },
  file?: string,
  folders?: string[],
  roots?: string[],
  model?: CSN,
})
```

Fills in the properties from options into the respective instance properties documented subsequently. For example this will create a new instance with properties [`file`](#file) and [`folder`](#folder) filled in from the passed in options:

```js
const b = new cds.i18n.bundle4 ({ file:'messages', folders:['/_i18n'] })
```





### `.default_language` {.property}

The locale used for [default translations](#defaults). By default `en` is used as the default locale, which can be changed through config option <Config> cds.i18n.default_language </Config>. {.indent}



### `.defaults` {.property}

Provides access to the default translations used as a first-level fallback if a locale-specific translation is not found. By default loads the translations with [`default_language`](#default_language) {.indent}



### `.fallback` {.property}

Provides access to the fallback translations used as a second-level fallback if a locale-specific translation is not found and also none in the [default translations](#defaults). {.indent}





### `.file` {.property}

This is the base name for properties files to load translations from by this bundle. For example the basename of the [`cds.i18n.messages`](#messages) bundle is `'messages'`, the basename of the [`cds.i18n.labels`](#labels) bundle is `'i18n'`:
{.indent}

```js
cds.i18n.messages.file  //> 'messages'
cds.i18n.labels.file   //> 'i18n'
```



### `.folders` {.property}

An array of folder names to fetch i18n files from. Values can be specified through the constructor for individual bundles. If not specified the value is taken from config option <Config keyOnly> cds.i18n.folders </Config>. *Default:* `['_i18n','i18n']`: {.indent}

[Learn more in Fetching i18n Folders below](#fetching-i18n-folders){.learn-more .indent}



### `.model` {.property}

The model passed in through the constructor, if any. Used when resolving relative [`.folders`](#folders) entries from the neighborhood of this model's `$sources`. {.indent}

[Learn more in Fetching i18n Folders below](#fetching-i18n-folders){.learn-more .indent}



### `.roots` {.property}

An array of root directories up to which to recurse up the filesystem hierarchy when searching for i18n [`.folders`](#folders). The default is `[ cds.root ]`. {.indent}

[Learn more in Fetching i18n Folders below](#fetching-i18n-folders){.learn-more .indent}



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





## Fetching i18n Folders...

### from models' neighborhood

By default, the config option <Config keyOnly> `cds.i18n.folders` </Config> is defined using relative folder names (i.e., ***without* leading slash**) as follows:

::: code-group

```json [package.json]
"cds": {
  "i18n": {
    "folders": ["_i18n","i18n"]
  }
}
```

:::

In effect i18n folders and hence files are fetched from the neighborhood of the current `cds.model`'s `$sources` as follows...

#### 1. Starting from model `$sources`

For example given these model sources in the *[cap/sflight](../get-started/samples#sflight-fiori-app)* sample: 

```js
$sources = cds.model.$sources //> ...
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

#### 2. Get distinct source directories

```js
$sourcedirs = Array.from(new Set($sources.map(path.dirname))).reverse() //> ...
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



#### 3. Check for existing & matching `i18n.folders`

For each of the source directories, we would now check for existence of a sub directory from the `i18n.folders` array containing files matching the bundle's [`.file`](#file) basename, and if none match move up the directory tree and repeat like that:

```sh
check /cap/sflight/node_modules/@sap/cds
  exists ./_i18n/i18n*.properties #>>>>>>>>>>>>>>>>>>>>>>> YES 

check /cap/sflight/db
  exists ./_i18n/i18n*.properties #> no
  exists ./i18n/i18n*.properties #> no
check /cap/sflight
  exists ./_i18n/i18n*.properties #>>>>>>>>>>>>>>>>>>>>>>> YES  

check /cap/sflight/srv
  exists ./_i18n/i18n*.properties #> no
  exists ./i18n/i18n*.properties #> no
check /cap/sflight #> already checked above

check /cap/sflight/app/travel_analytics
  exists ./_i18n/i18n*.properties #> no
  exists ./i18n/i18n*.properties #> no
check /cap/sflight/app
  exists ./_i18n/i18n*.properties #> no
  exists ./i18n/i18n*.properties #> no
check /cap/sflight #> already checked above

check /cap/sflight/app/travel_processor
  exists ./_i18n/i18n*.properties #> no
  exists ./i18n/i18n*.properties #> no
check /cap/sflight/app #> already checked above

check /cap/sflight/app #> already checked above
```



#### 4. Result: i18n folders used by bundle

So we would end up in having found these two directories from which we would load `.properties` files subsequently:

```js
i18n_folders = [
  '/cap/sflight/node_modules/@sap/cds/_i18n',
  '/cap/sflight/_i18n'
]
```



::: tip Why fetching from model's neighborhood?

The reason we do this fetching in the neighborhood of the current model's `.cds` source files is to easily support usage of reuse packages, which might come with own i18n bundles. As such reuse packages frequently bring own `.cds` models, we can take the locations of these as the starting points to search for i18n folders up the file system hierarchy. 

:::



### from static folders

In alternative to fetching i18n folders from models' neighborhood as explained above, you can also specify static folders to be used as is, by adding a **leading slash**. For example:

::: code-group

```json [package.json]
"cds": {
  "i18n": {
    "folders": [ "/_i18n", "/app/_i18n" ]
  }
}
```

:::

With that configuration, there is no search for i18n folders but all .properties files would be load from the respective directories within your project, e.g.:

```js
i18n_folders = [
  '/cap/sflight/_i18n',
  '/cap/sflight/app/_i18n'
]
```

You can also combine static folders with relative ones in your custom configs.



## Configuration Options

Find the configuration options to customize `cds.i18n` in the table below. You can use these options in your package.json like so:

::: code-group

```json [package.json]
"cds": {
  "i18n": {
    "default_language": "fr"
  }
}
```

:::

[Learn more about configuration in the reference docs for `cds.env`](cds-env){.learn-more}



| Config Option               | Description                                                  |
| --------------------------- | ------------------------------------------------------------ |
| `cds.i18n.file`             | The [`.file` basename](#file) used for the [`cds.i18n.labels`](#labels) bundle. <br />*Default:* `"i18n"`. |
| `cds.i18n.folders`          | An array of (relative) folder names that will be appended to the source directories in a cross-product fashion of the default `cds.model`  when fetching for existing i18n [`folders`](#folders). <br />*Default:* `["_i18n","i18n"]` |
| `cds.i18n.default_language` | The locale used for [default translations](#defaults). <br />*Default:* `"en"` |

::: danger

Please be aware that changing these configurations does not only affect your usage of your i18n bundles, but also all bundles provided by reuse packages you might use, including the ones provided by the CAP framework itself, such as the labels for the `@sap/cds/common` types, or the default messages used by the Node.js runtime.  

:::

::: warning

Ensure you correctly understand how the config option `cds.i18n.folders` work before changing it: essentially a **cartesian product** (*source dirs **x** i18n folders*) of all source directories with the entries in this config option is created to check each if such a directory exists and contains files matching the respective bundle's basename.

:::



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
