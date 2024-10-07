---
status: released
synopsis: >
  Available commands of the <code>cds</code> command line client
---

<script setup>
  import { h } from 'vue'
  const X =  () => h('span', { class: 'ga',      title: 'Available' },      ['✓']   )
  const Na = () => h('i',    { class: 'na',      title: 'not applicable' }, ['n/a'] )
  const D =  () => h('i',    { class: 'prog',    title: 'in progress'  },   ['in prog.'] )
  const O =  () => h('i',    { class: 'plan',    title: 'planned'  },       ['planned'] )
  const C =  () => h('i',    { class: 'contrib', title: 'contributions welcome'  }, ['contrib?'] )
  const Ac = () => h('i',    { class: 'contrib', title: 'active contributions'  },  ['contrib'] )
</script>
<style scoped lang="scss">
  .ga   { color: var(--vp-c-green-2);}
  .na   { color: gray; font-size:90%; }
  .prog { color: var(--vp-c-green-3); font-size:90%; font-weight:500; }
  .plan { color: gray; font-size:90% }
  .contrib { color: gray; font-size:90% }

  .add::before     { content: 'cds add '; color: #999 }
  .compile::before { content: 'cds compile --to '; color: #999 }
</style>

# CDS Command Line Interface (CLI) {#cli}

To use `cds` from your command line, install package  `@sap/cds-dk` globally:

```sh
npm i -g @sap/cds-dk
```

<ImplVariantsHint />

[[toc]]

## cds version

Use `cds version` to get information about your installed package version:

<!--@include: ./assets/help/cds-version.out.md-->

Using `--markdown` you can get the information in markdown format:

<!--@include: ./assets/help/cds-version-md.out.md-->


## cds completion <Since version="7.9.0" of="@sap/cds-dk" />

The `cds` command supports shell completion with the <kbd>tab</kbd> key for several shells and operating systems.

For Linux, macOS and Windows use the following command to activate shell completion:

```sh
cds add completion
```

After that, restart your shell (or source the shell configuration) and enjoy shell completion support for all `cds` commands.

Currently supported shells:
| Operating System  | Shell |
|-------------------|-------|
| Linux             | bash, fish (version 8 or higher), zsh |
| macOS             | bash, fish (version 8 or higher), zsh |
| Windows           | PowerShell, Git Bash |
| WSL               | bash, fish (version 8 or higher), zsh |

To remove the shell completion, run the following command:
```sh
cds completion --remove
```
Then source or restart your shell.


## cds help

Use `cds help` to see an overview of all commands:

<!--@include: ./assets/help/cds-help.out.md-->

Use `cds help <command>` or `cds <command> ?` to get specific help:

<!--@include: ./assets/help/cds-watch.out.md-->


## cds init

Use `cds init` to create new projects.

The simplest form creates a minimal Node.js project.  For Java, use

```sh
cds init --add java
```

In addition, you can add (most of) the project 'facets' from [below](#cds-add) right when creating the project.
For example to create a project with a sample bookshop model and configuration for SAP HANA, use:

```sh
cds init --add sample,hana
```



## cds add

Use `cds add` to gradually add capabilities ('facets') to projects.

The facets built into `@sap/cds-dk` provide you with a large set of standard features that support CAP's grow-as-you-go approach:


| Feature                       |     Node.js      |       Java       |
|-------------------------------|:----------------:|:----------------:|
| `tiny-sample`                 |       <X/>       |       <X/>       |
| `sample`                      |       <X/>       |       <X/>       |
| `mta`                         |       <X/>       |       <X/>       |
| `cf-manifest`                 |       <X/>       |       <X/>       |
| `helm`                        |       <X/>       |       <X/>       |
| `helm-unified-runtime`        |       <X/>       |       <X/>       |
| `containerize`                |       <X/>       |       <X/>       |
| `multitenancy`                |       <X/>       |       <X/>       |
| `toggles`                     |       <X/>       |       <X/>       |
| `extensibility`               |       <X/>       |       <X/>       |
| `xsuaa`                       |       <X/>       |       <X/>       |
| `hana`                        |       <X/>       |       <X/>       |
| `postgres`                    | <X/><sup>1</sup> | <X/><sup>1</sup> |
| `sqlite`                      |       <X/>       |       <X/>       |
| `h2`                          |      <Na/>       |       <X/>       |
| `liquibase`                   |      <Na/>       |       <X/>       |
| `local-messaging`             |       <X/>       |       <O/>       |
| `file-based-messaging`        |       <X/>       |       <O/>       |
| `enterprise-messaging`        |       <X/>       |       <O/>       |
| `enterprise-messaging-shared` |       <X/>       |       <O/>       |
| `redis-messaging`             | <X/><sup>1</sup> |       <O/>       |
| `kafka`                       |       <X/>       |       <X/>       |
| `approuter`                   |       <X/>       |       <X/>       |
| `connectivity`                |       <X/>       |       <X/>       |
| `destination`                 |       <X/>       |       <X/>       |
| `html5-repo`                  |       <X/>       |       <X/>       |
| `portal`                      |       <X/>       |       <X/>       |
| `application-logging`         |       <X/>       |       <X/>       |
| `audit-logging`               |       <X/>       |       <X/>       |
| `notifications`               |       <X/>       |       <O/>       |
| `attachments`                 |       <X/>       |       <X/>       |
| [`data`](#data)               |       <X/>       |       <X/>       |
| [`http`](#http)               |       <X/>       |       <X/>       |
| `lint`                        |       <X/>       |       <X/>       |
| `pipeline`                    |       <X/>       |       <X/>       |
| `typer`                       |       <X/>       |      <Na/>       |
| `typescript`                  |       <X/>       |      <Na/>       |
| `completion`                  |       <X/>       |       <X/>       |
| [`handler`](#handler)         |       <Na/>      |       <X/>       |

> <sup>1</sup> Only for Cloud Foundry <br>

### data {.add}

Adds files to the project that carry initial data, in either JSON and CSV format.

The simplest form of:

```sh
cds add data
```

adds _csv_ files with a single header line for all entities to the _db/data/_ folder.  The name of the files matches the entities' namespace and name, separated by `-`.

#### Filtering <Since version="7.9.0" of="@sap/cds-dk" /> {#data-filtering}

To create data for some entities only, use `--filter`.  For example:

```sh
cds add data --filter books
```

would only create data for entity names that include _books_ (case insensitive).

You can use regular expressions for more flexibility and precision.  For example, to only match _Books_, but not _Books.texts_, use:

```sh
cds add data --filter "books$"
```

::: details Special characters like `?` or `*` need escaping or quoting in shells

The escape character is usually the backslash, for example, `\?`.  Quote characters are `'` or `"` with varying rules between shells.  Consult the documentation for your shell here.
:::

#### Sample records <Since version="7.9.0" of="@sap/cds-dk" />

To create actual data (along with the header line), use `--records` with a number for how many records you wish to have.

This example creates 2 records for each entity:

```sh
cds add data --records 2
```

[Watch a short video by DJ Adams to see this in action.](https://www.youtube.com/shorts/_YVvCA2oSco){.learn-more}

#### Formats <Since version="7.9.0" of="@sap/cds-dk" />

By default, the data format is _CSV_.  You can change this to JSON with the `--content-type` option:

```sh
cds add data --content-type json
```

The result could look like this for a typical _Books_ entity from the _Bookshop_ application:

```jsonc
[
  {
    "ID": 29894036,
    "title": "title-29894036",
    "author": {
      "ID": 1343293
    },
    "stock": 94,
    "texts": [
      { ... }
    ]
  }
]
```

::: details Some details on the generated data
-  For the _JSON_ format, _structured_ objects are used instead of flattened properties, for example, `author: { ID: ... }` instead of `author_ID.` The flattened properties would work as well during database deployment and runtime though.  Flattened properties are also used in the _CSV_ format.
- `author.ID` refers to a key from the _...Authors.json_ file that is created at the same time.  If the _Authors_ entity is excluded, though, no such foreign key would be created, which cuts the association off.
- Data for _compositions_, like the `texts` composition to `Books.texts`, is always created.
- A random unique number for each record, _29894036_ here, is added to each string property, to help you correlate properties more easily.
- Data for elements annotated with a regular expression using [`assert.format`](../guides/providing-services#assert-format) can be generated using the NPM package [randexp](https://www.npmjs.com/package/randexp), which you need to installed manually.
- Other constraints like [type formats](../cds/types), [enums](../cds/cdl#enums), and [validation constraints](../guides/providing-services#input-validation) are respected as well, in a best effort way.
:::

#### Interactively in VS Code <Since version="7.9.0" of="@sap/cds-dk" />

In [VS Code](./cds-editors#vscode), use the commands _Generate Model Data as JSON / CSV_ to insert test data at the cursor position for a selected entity.


### http <Since version="7.9.0" of="@sap/cds-dk" /> {.add}

Adds `.http` files with sample read and write requests.

The simplest form of:

```sh
cds add http
```

creates `http` files for all services and all entities.


#### Filtering {#http-filtering}

See the filter option of [`add data`](#data-filtering) for the general syntax.
In addition, you can filter with a service name:

```sh
cds add http --filter CatalogService
```

#### Interactively in VS Code

In [VS Code](./cds-editors#vscode), use the command _Generate HTTP Requests_ to insert request data in an _http_ file for a selected entity or service.

#### Authentication / Authorization

##### To local applications

<div class="impl node">

By default, an authorization header with a [local mock user](../node.js/authentication#mock-users) is written to the `http` file, and `localhost` is the target host.

```http [Node.js]
@server = http://localhost:4004
@auth = Authorization: Basic alice:

### CatalogService.Books
GET {{server}}/odata/v4/admin/Books
{{auth}}
...
```
</div>

<div class="impl java">

By default, an authorization header with a [local mock user](../java/security#mock-users) is written to the `http` file, and `localhost` is the target host.

```http [Java]
@server = http://localhost:8080

### CatalogService.Books
GET {{server}}/odata/v4/admin/Books
{{auth}}
...
```
</div>


##### To remote applications

Use `--for-app <cf-appname>` to use a JWT token of a remote application.  For example:

```sh
cds add http --for-app bookshop
```

assumes a remote app named `bookshop` on CloudFoundry and a JWT token for this app is written to the request file:

```http
@server = https://...
@auth = x-approuter-authorization: bearer ...
```

::: details Cloud login required
For CloudFoundry, use `cf login ...` and select org and space.
:::

### handler <Since version="8.3.0" of="@sap/cds-dk" /> {.add}

Generates handler stubs for actions and functions in Java projects.

Execute the following from the _srv_ directory of the project to generate handler files for all actions and functions:
```sh
cds add handler
```


#### Filtering {#handler-filtering}

Use the `--filter` option to create handlers for specific actions and functions.

```sh
cds add handler --filter submitOrder
```

#### More Options

| Option | Description |
| --- | --- |
| `--out` | Specify custom output directories |
| `--force` | Overwrite existing files |


## cds env

Use `cds env` to inspect currently effective config settings:

<!--@include: ./assets/help/cds-env-requires-db.out.md -->


## cds compile

### mermaid <Since version="8.0.0" of="@sap/cds-dk" /> {.compile}

This produces text for a [Mermaid class diagram](https://mermaid.js.org/syntax/classDiagram.html):

```sh
cds compile db/schema.cds --to mermaid
```

Output:

```log
classDiagram
  namespace sap_fe_cap_travel {
    class `sap.fe.cap.travel.Travel`["Travel"]
    class `sap.fe.cap.travel.Booking`["Booking"]
    class `sap.fe.cap.travel.Airline`["Airline"]
    class `sap.fe.cap.travel.Airport`["Airport"]
    class `sap.fe.cap.travel.Flight`["Flight"]
  }
```

If wrapped in a markdown code fence of type `mermaid`, such diagram text is supported by many markdown renderers, for example, on [GitHub](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams).

````md
```mermaid
classDiagram
  namespace sap_fe_cap_travel {
    class `sap.fe.cap.travel.Travel`["Travel"]
    ...
  }
```
````

To customize the diagram layout, use these environment variables when calling `cds compile`:

```sh
CDS_MERMAID_ASSOCNAMES=false|true    # show association/composition names
CDS_MERMAID_ELEMENTS=false|all|keys  # no, all, or only key elements
CDS_MERMAID_MIN=false|true           # remove unused entities
CDS_MERMAID_NAMESPACES=false|true    # group entities by namespace
CDS_MERMAID_QUERIES=false|true       # show queries/projections
CDS_MERMAID_DIRECTION=TB|BT|LR|RL    # layout direction of the diagram
```

<div id="mermaid-cli-more" />

#### Interactively in VS Code

To visualize your CDS model as a diagram in VS Code, open a `.cds` file and use the dropdown in the editor toolbar or the command _CDS: Preview as diagram_:

![The screenshot is described in the accompanying text.](assets/mermaid-preview.png) {style="filter: drop-shadow(0 2px 5px rgba(0,0,0,.40));"}

If you don't see the graphics rendered, but only text, install the [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) extension for VS Code.

To customize the diagram layout, use these settings in the _Cds > Preview_ category:

- [Diagram: Associations](vscode://settings/cds.preview.diagram.associations)
- [Diagram: Direction](vscode://settings/cds.preview.diagram.direction)
- [Diagram: Elements](vscode://settings/cds.preview.diagram.elements)
- [Diagram: Minify](vscode://settings/cds.preview.diagram.minify)
- [Diagram: Namespaces](vscode://settings/cds.preview.diagram.namespaces)
- [Diagram: Queries](vscode://settings/cds.preview.diagram.queries)


## cds repl

Use `cds repl` to live-interact with Node.js APIs:

<pre class="log">
<span class="cwd">$</span> <span class="cmd">cds</span> <span class="args">repl</span>
<em>Welcome to cds repl</em>
> SELECT.from(Foo)
Query {
  SELECT: { from: { ref: [ <em>'Foo'</em> ] } }
}

> cds.requires.db
{
  impl: <em>'@cap-js/sqlite'</em>,
  credentials: { url: <em>':memory:'</em> },
  kind: <em>'sqlite'</em>
}
</pre>

## Debugging with `cds watch`

Start `cds watch` and enter `debug`. This restarts the application in debug mode. Similarly, `debug-brk` will start debug mode, but pause the application at the first line, so that you can debug bootstrap code.

If you do this in VS Code's integrated terminal with the 'Auto Attach' feature enabled, debugging starts right away. If you executed `cds watch` on a standalone terminal, you can still attach a Node.js debugger to the process.

For example:
- In VS Code, use the _Debug: Attach to Node Process_ command.
- In Chrome browser, just open [chrome://inspect](chrome://inspect) and click _Inspect_.
