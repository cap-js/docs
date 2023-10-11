---
label: cds-typer
synopsis: >
  This page explains the package cds-typer in depth.
# layout: node-js
status: released
---

# CDS Typer {#cds-typer}

The following chapter describes the [`cds-typer` package](https://www.npmjs.com/package/@cap-js/cds-typer) in detail using the [bookshop sample](https://github.com/SAP-samples/cloud-cap-samples/tree/main/bookshop) as a running example.

## Quickstart using VS Code {#cds-typer-vscode}
1. Make sure you have the [SAP CDS Language Support extension for VS Code](https://marketplace.visualstudio.com/items?itemName=SAPSE.vscode-cds) installed.
2. See that cds-typer is enabled in your VS Code settings (CDS > Type Generator > Enabled).
3. In your project's root, execute `cds add typer`.
4. Install the newly added dev-dependency using `npm i`.
5. Saving any _.cds_ file of your model from VS Code triggers the type generation process.
6. Model types now have to be imported to service implementation files by traditional imports of the generated files:

```js
//  without cds-typer
const { Books } = cds.entities(…)
service.before('CREATE' Books, ({ data }) => { /* data is of type any */})

// ✨ with cds-typer
const { Books } = require('#cds-models/…')
service.before('CREATE' Books, ({ data }) => { /* data is of type Books */})
```


::: details How it works:

The extension will automatically trigger the type generator whenever you hit _save_ on a _.cds_ file that is part of your model. That ensures that the generated type information stays in sync with your model. If you stick to the defaults, saving a _.cds_ file will have the type generator emit [its type files](#emitted-type-files) into the directory _@cds-models_ in your project's root.

Opening your VS Code settings and typing "`cds type generator`" into the search bar will reveal several options to configure the type generation process. Output, warnings, and error messages of the process can be found in the output window called "`CDS`".

:::

[Learn more about the `typer` facet.](#typer-facet){.learn-more}
[Learn about other options to use `cds-typer`.](#usage-options){.learn-more}

## Using Emitted Types in Your Service
The types emitted by the type generator are tightly integrated with the CDS API. The following section illustrates where the generated types are recognized by CDS.

### CQL

Most CQL constructs have an overloaded signature to support passing in generated types. Chained calls will offer code completion related to the type you pass in.

```js
// how you would have done it before (and can still do it)
SELECT('Books')  // etc...

// how you can do it using generated types
const { Book, Books } = require('#cds-models/sap/capire/Bookshop')

// SELECT
SELECT(Books)
SELECT.one(Book)
SELECT(Books, b => { b.ID })  // projection
SELECT(Books, b => { b.author(a => a.ID.as('author_id')) })  // nested projection

// INSERT / UPSERT
INSERT.into(Books, […])
INSERT.into(Books).columns(['title', 'ID'])  // column names derived from Books' properties

// DELETE
DELETE(Books).byKey(42)
```

Note that your entities will expose additional capabilities in the context of CQL, such as the `.as(…)` method to specify an alias.

### CRUD Handlers
The CRUD handlers `before`, `on`, and `after` accept generated types:

```js
// the paylod is known to contain Books inside the respective handlers
service.before('READ', Books, req => { … }
service.on('READ', Books, req => { … }
service.after('READ', Books, req => { … }
```
<!--
🚧 **NOTE to editors:** this particular section is subject to change, as per our last sync.

Note that you can pass in both singular, as well as plural versions of your entity. Doing so will slightly alter the semantics of the handler. Passing the plural will result in a callback that is called _once_ with the entire result set. Passing the singular will cause the callback to be called once _for each_ element of the result set:

```js
service.on('READ', Books, req => req.data[0].ID)
service.on('READ', Book,  req => req.data.ID)
```
-->
### Actions

In the same manner, actions can be combined with `on`:

```js
const { submitOrder } = require('#cds-models/sap/capire/Bookshop')

service.on(submitOrder, (…) => { /* implementation of 'submitOrder' */ })
```

::: warning _Lambda Functions vs. Fully Fledged Functions_

Using anything but lambda functions for either CRUD handler or action implementation will make it impossible for the LSP to infer the parameter types.

You can remedy this by specifying the expected type with one of the following options.

Using [JSDoc](https://jsdoc.app/) in JavaScript projects:

```js
service.on('READ', Books, readBooksHandler)

/** @param {{ data: import('#cds-models/sap/capire/Bookshop').Books }} req */
function readBooksHandler (req) {
  // req.data is now properly known to be of type Books again
}
```

Using `import type` in TypeScript projects:

```ts
import type { Books } from '#cds-models/sap/capire/bookshop'

service.on('READ', Books, readBooksHandler)

function readBooksHandler (req: {{ data: Books }}) {
  // req.data is now properly known to be of type Books again
}
```

:::


### Enums

CDS enums are supported by `cds-typer` and are represented during runtime as well. So you can assign values to enum-typed properties with more confidence:

```cds
type Priority: String enum {
  LOW = 'Low';
  MEDIUM = 'Medium';
  HIGH = 'High';
}

entity Tickets {
  priority: Priority;
  …
}
```

```js
const { Ticket, Priority } = require('…')

service.before('CREATE', Ticket, (req) => {
  req.data.priority = Priority.LOW  // [!code focus]
  //         /                 \  // [!code focus]
  // inferred type: Priority    suggests LOW, MEDIUM, HIGH  // [!code focus]
})

```

### Handling Optional Properties
Per default, all properties of emitted types are set to be optional. This reflects how entities can be partial in handlers.

CDS file:

```cds
entity Author {
    name: String; // [!code focus]
    …
}

entity Book {
    author: Association to Author; // [!code focus]
    …
}
```

Generated type file:

```ts
class Author {
    name?: string // [!code focus]
    …
}

class Book {
    author?: Association.to<Author>  // [!code focus]
    …
}
```

In consequence, you will get called out by the type system when trying to chain property calls. You can overcome this in a variety of ways:

```ts
const myBook: Book = …

// (i) optional chaining
const authorName = myBook.author?.name

// (ii) explicitly ruling out the undefined type
if (myBook.author !== undefined) {
    const authorName = myBook.author.name
}

// (iii) non-null assertion operator
const authorName = myBook.author!.name

// (iv) explicitly casting your object to a type where all properties are attached
const myAttachedBook = myBook as Required<Book>
const authorName = myAttachedBook.author.name

// (v) explicitly casting your object to a type where the required property is attached
const myPartiallyAttachedBook = myBook as Book & { author: Author }
const authorName = myPartiallyAttachedBook.author.name
```

Note that (iii) through (v) are specific to TypeScript, while (i) and (ii) can also be used in JavaScript projects.

## Fine Tuning
### Singular/ Plural
The generated types offer both a singular and plural form for convenience. The derivation of these names uses a heuristic that assumes entities are named with an English noun in plural form, following the [best practice guide](https://cap.cloud.sap/docs/guides/domain-modeling#pluralize-entity-names).

Naturally, this best practice can't be enforced on every model. Even for names that do follow best practices, the heuristic can fail. If you find that you would like to specify custom identifiers for singular or plural forms, you can do so using the `@singular` or `@plural` annotations.

CDS file:
```cds
// model.cds
@singular: 'Mouse'
entity Mice { … }

@plural: 'FlockOfSheep'
entity Sheep { … }
```

Generated type file:

```ts
// index.ts
export class Mouse { … }
export class Mice { … }
export class Sheep { … }
export class FlockOfSheep { … }
```

### Strict Property Checks in JavaScript Projects
You can enable strict property checking for your JavaScript project by adding the [`checkJs: true`](https://www.typescriptlang.org/tsconfig#checkJs) setting to your _jsconfig.json_ or _tsconfig.json_.
This will consider referencing properties in generated types that are not explicitly defined as error.

## Usage Options

Besides using the [SAP CDS Language Support extension for VS Code](https://marketplace.visualstudio.com/items?itemName=SAPSE.vscode-cds), you have the option to use `cds-typer` on the command line.

### Command Line Interface (CLI) {#typer-cli}

```sh
npx @cap-js/cds-typer /home/mybookshop/db/schema.cds --outputDirectory /home/mybookshop
```

The CLI offers several parameters which you can list using the `--help` parameter.

::: details You should then see the following output:

<!-- TODO: automatically pull command line options from cds-typer --help -->
```log

> @cap-js/cds-typer@0.4.0 cli
> node lib/cli.js --help

SYNOPSIS

  cds-typer [cds file | "*"]

  Generates type information based on a CDS model.
  Call with at least one positional parameter pointing
  to the (root) CDS file you want to compile.

OPTIONS

  --help

    This text.

  --inlineDeclarations: <flat | structured>
    (default: structured)

    Whether to resolve inline type declarations
    flat: (x_a, x_b, ...)
    or structured: (x: {a, b}).

  --jsConfigPath: <string>

    Path to where the jsconfig.json should be written.
    If specified, cds-typer will create a jsconfig.json file and
    set it up to restrict property usage in types entities to
    existing properties only.

  --logLevel: <TRACE | DEBUG | INFO | WARNING | ERROR | CRITICAL | NONE>
    (default: NONE)

    Minimum log level that is printed.

  --outputDirectory: <string>
    (default: ./)

    Root directory to write the generated files to.

  --propertiesOptional: <true | false>
    (default: true)

    If set to true, properties in entities are
    always generated as optional (a?: T).

  --version

    Prints the version of this tool.
```
:::

## Integrate Into TypeScript Projects
The types emitted by `cds-typer` can be used in TypeScript projects as well! Depending on your project setup you may have to do some manual configuration.

1. Make sure the directory the types are generated into are part of your project's files. You will either have to add that folder to your `rootDirs` in your _tsconfig.json_ or make sure the types are generated into a directory that is already part of your `rootDir`.
2. Preferably run the project using `cds-ts`.
3. If you have to use `tsc`, for example for deployment, you have to touch up on the generated files. Assume your types are in _@cds-models_ below your project's root directory and your code is transpiled to _dist/_, you would use:

```sh
tsc && cp -r @cds-models dist
```

## Integrate Into Your CI
As the generated types are build artifacts, we recommend to exclude them from your software versioning process. Still, as using `cds-typer` changes how you include your model in your service implementation, you need to include the emitted files when releasing your project or running tests in your continuous integration pipeline.
You should therefore trigger `cds-typer` as part of your build process. One easy way to do so is to add a variation of the following command to your build script:

```sh
npx @cap-js/cds-typer "*" --outputDirectory @cds-models
```
Make sure to add the quotes around the asterisk so your shell environment does not expand the pattern.

## Integrate Into Your Multitarget Application
Similar to the integration in your CI, you need to add `cds-typer` to the build process of your MTA file as well.

::: code-group
```yaml [mta.yaml]
build-parameters:
  before-all:
  - builder: custom
    commands:
    - npx cds build --production
    - npx @cap-js/cds-typer "*" --outputDirectory gen/srv/@cds-models
```
:::

This integration into a custom build ensures that the types are generated into the `gen/srv` folder, so that they are present at runtime.

## About The Facet {#typer-facet}
Type generation can be added to your project as [facet](../tools/#cds-init-add) via `cds add typer`.

::: details Under the hood

Adding this facet effectively does four things:

1. Adds `@cap-js/cds-typer` as a dev-dependency (⚠️ which you still have to install using `npm i`)
2. Creates (or modifies) a _jsconfig.json_ file to support intellisense for the generated types
3. Modifies _package.json_ to enable [subpath imports](https://nodejs.org/api/packages.html#subpath-imports) for the generated types
4. Adds `@cds-models` (the default output folder for generated files) to your project's _.gitignore_
:::

::: warning _TypeScript Projects_

Adding the facet in a TypeScript project will adjust your _tsconfig.json_ instead. Note that you may have to manually add the type generator's configured output directory to the `rootDirs` entry in your
_tsconfig.json_, as we do not want to interfere with your configuration.

:::


## About the Emitted Type Files {#emitted-type-files}

The emitted types are bundled into a directory which contains a nested directory structure that mimics the namespaces of your CDS model. For the sake of brevity, we will assume them to be in a directory called _@cds-models_ in your project's root in the following sections.
For example, the sample model contains a namespace `sap.capire.bookshop`. You will therefore find the following file structure after the type generation has finished:

```txt
@cds-models
└───sap
    └───capire
        └───bookshop
              index.js
              index.ts
```

Each _index.ts_ file will contain type information for one namespace. For each entity belonging to that namespace, you will find two exports, a singular and a plural form:

```ts
// @cds-models/sap/capire/bookshop/index.ts
export class Author { … }
export class Authors { … }
export class Book { … }
export class Books { … }
```

The singular forms represent the entities from the original model and try to adhere to best practices of object oriented programming for naming classes in singular form.
The plural form exists as a convenience to refer to a collection of multiple entities. You can [fine tune](#fine-tuning) both singular and plural names that are used here.

You could import these types by using absolute paths, but there is a more convenient way for doing so which will be described in the next section.

## Subpath Imports
Adding type support via `cds add typer` includes adding [subpath imports](https://nodejs.org/api/packages.html#subpath-imports). Per default, the facet adds a mapping of `#cds-models/` to the default path your model's types are assumed to be generated to (_\<project root\>/@cds-models/_). If you are generating your types to another path and want to use subpath imports, you will have to adjust this setting in your _package.json_ **and** _jsconfig.json_/ _tsconfig.json_ accordingly.

Consider [the bookshop sample](https://github.com/SAP-samples/cloud-cap-samples/tree/main/bookshop) with the following structure with types already generated into _@cds-models_:

```txt
bookstore
│   package.json
│
└───@cds-models
│   └───<described in the previous section>
│
└───db
│      schema.cds
│      …
│
└───srv
│      cat-service.cds
│      cat-service.js
│       …
│
└─── …
```

The following two (equally valid) statements would amount to the same import [from within the catalog service](https://github.com/SAP-samples/cloud-cap-samples/blob/main/bookshop/srv/cat-service.js):

```js
// srv/cat-service.js
const { Books } = require('../@cds-models/sap/capire/bookshop')
const { Books } = require('#cds-models/sap/capire/bookshop')
```

These imports will behave like [`cds.entities('sap.capire.bookshop')`](https://pages.github.tools.sap/cap/docs/node.js/cds-reflect#entities) during runtime, but offer you code completion and type hinting at design time:

```js
class CatalogService extends cds.ApplicationService { init(){
  const { Book } = require('#cds-models/sap/capire/bookshop')

  this.on ('UPDATE', Book, req => {
    // in here, req is known to hold a payload of type Book.
    // Code completion therefore offers all the properties that are defined in the model.
  })
})
```

Just as with `cds.entities(…)`, these imports can't be static, but need to be dynamic:

```js
// ❌ works during design time, but will cause runtime errors
const { Book } = require('#cds-models/sap/capire/bookshop')

class CatalogService extends cds.ApplicationService { init(){
  // ✅ works both at design time and at runtime
  const { Book } = require('#cds-models/sap/capire/bookshop')
})
```
