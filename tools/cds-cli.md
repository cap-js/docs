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

  .add::before { content: 'cds add '; color: #999 }
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

<pre class="log">
<span class="cwd">$</span> <span class="cmd">cds</span> <span class="args">version</span>

<em>@capire/samples:</em> 2.0.0
<em>@sap/cds:</em> 7.9.1
<em>@sap/cds-compiler:</em> 4.9.0
<em>@sap/cds-dk:</em> 7.9.1
<em>@sap/cds-dk (global):</em> 6.7.0
<em>@sap/cds-mtxs:</em> 1.18.0
<em>@sap/eslint-plugin-cds:</em> 3.0.3
<em>Node.js:</em> v18.13.0
<em>home:</em> .../node_modules/@sap/cds

<span class="cwd">$</span> <span class="cmd">cds</span> <span class="args">version</span> <span class="flags">--markdown</span>

| @capire/samples        | https://github.com/sap-samples/cloud-cap-samples.git |
|------------------------|------------------------------------------------------|
| Node.js                | v18.13.0                                             |
| @sap/cds               | 7.9.1                                                |
| @sap/cds-compiler      | 4.9.0                                                |
| @sap/cds-dk            | 7.9.1                                                |
| @sap/eslint-plugin-cds | 3.0.3                                                |
</pre>

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
| Linux             | bash, zsh |
| macOS             | bash, zsh |
| Windows           | PowerShell, Git Bash |
| WSL               | bash, zsh |

To remove the shell completion, run the following command:
```sh
cds completion --remove
```
Then source or restart your shell.


## cds help

Use `cds help` to see an overview of all commands:

<pre class="log">
<span class="cwd">$</span> <span class="cmd">cds</span> <span class="args">help</span>

USAGE

    <em>cds</em> &lt;command&gt; [&lt;args&gt;]
    <em>cds</em> &lt;src&gt;  =  cds compile &lt;src&gt;
    <em>cds</em>        =  cds help

COMMANDS

    <em>i | init</em>       jump-start cds-based projects
    <em>a | add</em>        add a feature to an existing project
    <em>y | bind</em>       bind application to remote services
    <em>m | import</em>     add models from external sources
    <em>c | compile</em>    compile cds models to different outputs
    <em>p | parse</em>      parses given cds models
    <em>s | serve</em>      run your services in local server
    <em>w | watch</em>      run and restart on file changes
    <em>r | repl</em>       read-eval-event loop
    <em>e | env</em>        inspect effective configuration
    <em>b | build</em>      prepare for deployment
    <em>d | deploy</em>     deploy to databases or cloud
    <em>l | login</em>      login to extendable SaaS application
    <em>t | lint</em>       [beta] run linter for env or model checks
    <em>v | version</em>    get detailed version information
    <em>? | help</em>       get detailed usage information
    <em>  | pull</em>       pull base model for a SaaS app extension
    <em>  | push</em>       push extension to SaaS app to enable or update it
    <em>  | subscribe</em>  subscribe a tenant to a multitenant SaaS app
    <em>  | completion</em> add/remove shell completion for cds commands
    <em>  | mock</em>       call cds serve with mocked service

  Learn more about each command using:
  <em>cds help</em> &lt;command&gt; or
  <em>cds</em> &lt;command&gt; <em>--help</em>
</pre>


Use `cds help <command>` or `cds <command> ?` to get specific help:

<pre class="log">
<span class="cwd">$</span> <span class="cmd">cds</span> <span class="args">watch</span> <span class="flags">--help</span>

<em>SYNOPSIS</em>

  <em>cds watch</em> [&lt;project&gt;]

  Tells cds to watch for relevant things to come or change in the specified
  project or the current work directory. Compiles and (re-)runs the server
  on every change detected.

  Actually, cds watch is just a convenient shortcut for:
  <em>cds serve all --with-mocks --in-memory?</em>

OPTIONS

  <em>--port</em> &lt;number&gt;

    Specify the port on which the launched server listens.
    If you specify '0', the server picks a random free port.
    Alternatively, specify the port using env variable PORT.

  <em>--ext</em> &lt;extensions&gt;

    Specify file extensions to watch for in a comma-separated list.
    Example: cds w --ext cds,json,js.

  <em>--livereload</em> &lt;port | false&gt;

    Specify the port for the livereload server. Defaults to '35729'.
    Disable it with value false.

  <em>--open</em> &lt;url&gt;

    Open the given URL (suffix) in the browser after starting.
    If none is given, the default application URL will be opened.

SEE ALSO

  <em>cds serve --help</em> for the different start options.
</pre>



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
| `hana`                        |       <X/>       |       <X/>       |
| `postgres`                    | <X/><sup>1</sup> | <X/><sup>1</sup> |
| `liquibase`                   |      <Na/>       |       <X/>       |
| `h2`                          |      <Na/>       |       <X/>       |
| `multitenancy`                |       <X/>       |       <X/>       |
| `toggles`                     |       <X/>       |       <X/>       |
| `extensibility`               |       <X/>       |       <X/>       |
| `application-logging`         | <X/><sup>1</sup> | <X/><sup>1</sup> |
| `audit-logging`               |       <O/>       |       <O/>       |
| `html5-repo`                  |       <X/>       |       <X/>       |
| `approuter`                   |       <X/>       |       <X/>       |
| `connectivity`                |       <X/>       |       <X/>       |
| [`data`](#data)               |       <X/>       |       <X/>       |
| [`http`](#http)               |       <X/>       |       <X/>       |
| `destination`                 |       <X/>       |       <X/>       |
| `enterprise-messaging`        |       <X/>       |       <O/>       |
| `enterprise-messaging-shared` |       <X/>       |       <O/>       |
| `redis-messaging`             | <X/><sup>1</sup> |       <O/>       |
| `local-messaging`             |       <X/>       |       <O/>       |
| `file-based-messaging`        |       <X/>       |       <O/>       |
| `kafka`                       |       <X/>       |       <X/>       |
| `helm`                        |       <X/>       |       <X/>       |
| `helm-unified-runtime`        |       <X/>       |       <X/>       |
| `mta`                         |       <X/>       |       <X/>       |
| `notifications`               |       <X/>       |       <O/>       |
| `pipeline`                    |       <X/>       |       <X/>       |
| `sample`                      |       <X/>       |       <X/>       |
| `tiny-sample`                 |       <X/>       |       <X/>       |
| `sqlite`                      |       <X/>       |       <X/>       |
| `typer`                       |       <X/>       |      <Na/>       |
| `xsuaa`                       |       <X/>       |       <X/>       |

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

The escape character is usually the backslash, e.g. `\?`.  Quote characters are `'` or `"` with varying rules between shells.  Consult the documentation for your shell here.
:::

#### Sample records <Since version="7.9.0" of="@sap/cds-dk" />

To create actual data (along with the header line), use `--records` with a number for how many records you wish to have.

This example creates 2 records for each entity:

```sh
cds add data --records 2
```


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


## cds env

Use `cds env` to inspect currently effective config settings:

<pre class="log">
<span class="cwd">$</span> <span class="cmd">cds</span> <span class="args">env get</span> <span class="flags">requires.db</span>
{
  impl: <em>'@sap/cds/libx/_runtime/sqlite/Service.js'</em>,
  credentials: { url: <em>':memory:'</em> },
  kind: <em>'sqlite'</em>
}
</pre>


## cds repl

Use `cds repl` to live-interact with Node.js APIs:

<pre class="log">
<span class="cwd">$</span> <span class="cmd">cds</span> <span class="args">repl</span>
<em>Welcome to cds repl v6.7.0</em>
> SELECT.from(Foo)
Query {
  SELECT: { from: { ref: [ <em>'Foo'</em> ] } }
}

> cds.requires.db
{
  impl: <em>'@sap/cds/libx/_runtime/sqlite/Service.js'</em>,
  credentials: { url: <em>':memory:'</em> },
  use: [Getter],
  kind: <em>'sqlite'</em>
}
</pre>

## Debugging with `cds watch`

Start `cds watch` and enter `debug`. This restarts the application in debug mode. Similarly, `debug-brk` will start debug mode, but pause the application at the first line, so that you can debug bootstrap code.

If you do this in VS Code's integrated terminal with the 'Auto Attach' feature enabled, debugging starts right away. If you executed `cds watch` on a standalone terminal, you can still attach a Node.js debugger to the process.

For example:
- In VS Code, use the _Debug: Attach to Node Process_ command.
- In Chrome browser, just open [chrome://inspect](chrome://inspect) and click _Inspect_.
