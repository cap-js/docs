---
label: cds-add
synopsis: >
  Learn how to create a `cds add` plugin.
# status: released
---

<style scoped lang="scss">
  @mixin counter-style {
    content: counter(my-counter);
    color: $counter-color;
    background-color: $counter-bg;
    width: $counter-size;
    height: $counter-size;
    line-height: $counter-line-height;
    border-radius: $counter-radius;
    font-weight: $counter-font-weight;
    text-align: center;
    font-size: $counter-font-size;
    vertical-align: middle;
    display: inline-block;
    position: relative;
    top: -2px;
  }
  h3 code + em { color: #666; font-weight: normal; }
  .cols-2 {
    display: flex;
    flex-wrap: wrap;
  }
  .cols-2 > * {
    width: 100%;
  }
  @media (min-width: 850px) {
    .cols-2 {
      gap: 1em;
    }
    .cols-2 > * {
      flex: 1;
      width: calc(100% / 2);
    }
  }
  .list-item {@include counter-style;}
  ol {
    margin-left: 10px;
    counter-reset: my-counter;
    li {
      counter-increment: my-counter;
      list-style: none;
      &::before {
        @include counter-style;
        left: -30px;
        margin-right: -20px;
      }
      p {display: inline;}
    }
  }
}

</style>

# Plugins for `cds add`{#cds-add}

<!-- `cds add` commands add project configuration to your CAP app. -->

[[toc]]

## Create a Plugin from Scratch

CAP provides APIs to let you create your own `cds add` plugins. In addition, we provide you with utility functions for common tasks, to enable seamless integration with the look-and-feel of built-in commands.

### Example: `cds add postgres`

In the following, we show you how to implement a `cds add` plugin for PostgreSQL support.

Our `cds add postgres` should:

1. Add helper files to start a PostgreSQL instance for development
2. Integrate with `cds add mta` for [Cloud Foundry]() deployment
3. Integrate with `cds add helm` for [Kyma]() deployment

First, we need to register our plugin:

::: code-group
```js [cds-plugin.js]
cds.add?.register?.('postgres', require('lib/add')) // ...or inline:
cds.add?.register?.('postgres', class extends cds.add.Plugin {})
:::

In our example, we offload the implementation to a file _lib/add.js_. Plugins usually implement the `run` and `combine` methods:

::: code-group
```js [lib/add.js]
const cds = require('@sap/cds-dk') //> load from cds-dk

module.exports = class extends cds.add.Plugin {
  async run() {
    /* called when running this plugin */
  }
  async combine() {
    /* called when running this or any other cds add plugin */
  }
}
```
:::


In the `run` method, we add all configuration that is not dependent on and might not be changed by other plugins. It's only invoked for `cds add postgres`.

In contrast, `combine` is executed independent of the executed `cds add` command. For example, it is also invoked for `cds add mta`. It allows the plugin to integrate accordingly.

Let's start with requirement <span class="list-item">1</span> to

::: code-group
```js [lib/add.js]
const cds = require('@sap/cds-dk') //> load from cds-dk
const { write, path } = cds.utils, { join } = path // [!code ++]

module.exports = class extends cds.add.Plugin {
  async run() {
    const pg = join(__dirname, 'pg.yaml') // [!code ++]
    await copy(pg).to('pg.yaml') //> 'to' is relative to cds.root // [!code ++]
  }
  async combine() {
    /* called when running this or any other cds add plugin */
  }
}
```
```yaml [pg.yaml] {.added}
services: # [!code ++]
  db: # [!code ++]
    image: postgres:alpine # [!code ++]
    environment: { POSTGRES_PASSWORD: postgres } # [!code ++]
    ports: [ '5432:5432' ] # [!code ++]
    restart: always # [!code ++]
```
:::

::: tip Common integrations
Typically integrations are for deployment descriptors (`cds add mta` and `cds add helm`), security descriptors (`cds add xsuaa`), or changes that might impact your plugin configuration (`cds add multitenancy`).
:::

In our example, we'll integrate with `cds add mta` to augment the _mta.yaml_ deployment descriptor for Cloud Foundry. For that purpose, we create an _mta.yaml.hbs_ file to use as a template. The _.hbs_ file also allows dynamic replacements using the [Handlebars]() syntax.

[Lean more about Handlebars support](){.learn-more}


Using the `merge` helper provided by the `cds.add` API we can merge this template into the project's `mta.yaml`:

::: code-group
```js [lib/add.js]
const cds = require('@sap/cds-dk') //> load from cds-dk
const { write, path } = cds.utils, { join } = path
const { readProject, merge, registries } = cds.add // [!code ++]
const { srv4 } = registries.mta // [!code ++]

module.exports = class extends cds.add.Plugin {
  async run() {
    const pg = join(__dirname, 'pg.yaml')
    await copy(pg).to('pg.yaml')
  }
  async combine() {
    const project = readProject() // [!code ++]
    const { hasMta, srvPath } = project // [!code ++]
    if (hasMta) { // [!code ++]
      const srv = srv4(srvPath) // Node.js or Java server module // [!code ++]
      const postgres = { in: 'resources', // [!code ++]
        where: { 'parameters.service': 'postgresql-db' } // [!code ++]
      } // [!code ++]
      const postgresDeployer = { in: 'modules', // [!code ++]
        where: { type: 'nodejs', path: 'gen/pg' } // [!code ++]
      } // [!code ++]
      await merge(__dirname, 'files/mta.yml.hbs').into('mta.yaml', { // [!code ++]
        project, // for Handlebars replacements // [!code ++]
        additions: [srv, postgres, postgresDeployer], // [!code ++]
        relationships: [{ // [!code ++]
            insert: [postgres, 'name'], // [!code ++]
            into: [srv, 'requires', 'name'] // [!code ++]
        }, { // [!code ++]
          insert: [postgres, 'name'], // [!code ++]
          into: [postgresDeployer, 'requires', 'name'] // [!code ++]
        }] // [!code ++]
      }) // [!code ++]
    } // [!code ++]
    // if (hasHelm) {// [!code ++]
    //  ... // [!code ++]
    // if (hasMultitenancy) {// [!code ++]
    //  ... // [!code ++]
  }
}
```
```yaml [lib/add/mta.yaml.hbs]
modules: # [!code ++]
  - name: {{appName}}-srv # [!code ++]
    type: {{language}} # [!code ++]
    path: {{& srvPath}} # [!code ++]
    requires: # [!code ++]
      - name: {{appName}}-postgres # [!code ++]
  - name: {{appName}}-postgres-deployer # [!code ++]
    type: nodejs # [!code ++]
    path: gen/pg # [!code ++]
    parameters: # [!code ++]
      buildpack: nodejs_buildpack # [!code ++]
      no-route: true # [!code ++]
      no-start: true # [!code ++]
      tasks: # [!code ++]
        - name: deploy-to-postgresql # [!code ++]
          command: npm start # [!code ++]
    requires: # [!code ++]
      - name: {{appName}}-postgres # [!code ++]
resources: # [!code ++]
  - name: {{appName}}-postgres # [!code ++]
    type: org.cloudfoundry.managed-service # [!code ++]
    parameters: # [!code ++]
      service: postgresql-db # [!code ++]
      service-plan: development # [!code ++]
```
:::

## Plugin API

Find here a complete overview of public `cds add` APIs.

### `register(name, impl)` {.method}

Register a plugin for `cds add` by providing a name and plugin implementation:

::: code-group
```js [cds-plugin.js]
/* ... */

cds.add?.register?.('@cap-js/postgres',
  class extends cds.add.Plugin {
    async run() { /* ... */ }
    async combine() { /* ... */ }
  }
)
```
:::

...or use the standard Node.js `require` mechanism to load  it from elsewhere:
```js
cds.add?.register?.('@cap-js/postgres', require('./lib/add') )
```

<!-- ### `Plugin` {.class}

```js

``` -->
<!--
### `hasInProduction(env)` {.method}

Indicate whether the plugin is used in production. Other plugins might react upon that information in `combine()`.

```js
static hasInProduction(env) {
  return env.requires.db.kind === 'postgres'
}
```

```js
static hasInProduction(env) {
  return
}

::: tip The `env` here is the productive env
To check the effective configuration like this, run this in your project root:
```sh
cds env --for production
```
::: -->

### `run()` {.method}

This method is invoked when `cds add` is run for your plugin. In here, do any modifications that are not depending on other plugins and must be run once only.

```js
async run() {
  const { copy, path } = cds.utils, { mvn, readProject } = cds.add
  await copy (path.join(__dirname, 'files/pg.yaml')).to('pg.yaml')
  const { isJava } = readProject()
  if (isJava) await mvn.add('postgres')
}
```

> In contrast to `combine`, `run` is not invoked when other `cds add` commands run.

### `combine()` {.method}

This method is invoked `cds add` is run for other plugins. In here, do any modifications with dependencies on other plugins.

Those adjustments typically include enhancing the _mta.yaml_ for Cloud Foundry or _values.yaml_ for Kyma, or adding roles to an _xs-security.json_.

```js
async combine() {
  const { hasMta, hasXsuaa, hasHelm } = readProject()
  if (hasMta)   { /* adjust mta.yaml */ }
  if (hasHelm)  { /* adjust values.yaml */ }
  if (hasXsuaa) { /* adjust xs-security.json */  }
}
```

### `dependencies()` {.method}

The `dependencies` function allows to specify other plugins that need to be run as a prerequisite:
```js
dependencies() {
  return ['xsuaa'] //> runs 'cds add xsuaa' before plugin is run
}
```

::: warning Use this feature sparingly
Having to specify hard-wired dependencies could point to a lack of coherence in the plugin.
:::

## Utilities API

### `readProject()` {.method}

This method lets you retrieve a project descriptor for the productive environment.

```js
const { isJava, hasMta, hasPostgres } = cds.add.readProject()
```

You may also use the generic `has` function, although without handlebars support.
```js
const { has } = readProject()
if (has('mta')) { /* something */ }
```

### `merge(from).into(file, o?)` {.method}

CAP provides a uniform convenience API to simplfiy merging operations on the most typical configuration formats — JSON and YAML files.

A large number of merging operations can be done without specifying additional semantics, but simply specifying `from` and `file`:

```js
cds.add.merge({ cds: { requires: {  } } })
```


<div class="cols-2">

<div>

```js
// source.json
"cds": {
  "my-plugin": {

  }
}
```

</div>

<div>

```js
// target.json
{
  "...": "..."
  "my-plugin": { // [!code ++]
    "k-1": "value" // [!code ++]
  } // [!code ++]
}
```

</div>

</div>

More complex configuration.

```js
const { merge, readProject, registries } = cds.add

// Generic variants for maps and flat arrays
await merge(__dirname, 'lib/add/package-plugin.json').into('package.json')
await merge({ some: 'variable' }).into('package.json')

// With handlebars replacements
const project = readProject()
await merge(__dirname, 'lib/add/package.json.hbs').into('package.json', {
  with: project
})
```

For the `@cap-js/postgres` plugin, we also specify semantics for the merge:

```js
// With handlebars replacements and semantics for nested arrays
const srv = registries.mta.srv4(srvPath)
const postgres = {
  in: 'resources',
  where: { 'parameters.service': 'postgresql-db' }
}
const postgresDeployer = {
  in: 'modules',
  where: { type: 'nodejs', path: 'gen/pg' }
}
await merge(__dirname, 'lib/add/mta.yml.hbs').into('mta.yaml', {
  with: project,
  additions: [srv, postgres, postgresDeployer],
  relationships: [{
    insert: [postgres, 'name'],
    into: [srv, 'requires', 'name']
  }, {
    insert: [postgres, 'name'],
    into: [postgresDeployer, 'requires', 'name']
  }]
})
```

### `registries` {.property}

`cds.add` provides a default registry of common elements in configuration files.

```js
const { srv4, approuter } = cds.add.registries.mta
```

...and use it like this:

```js
const project = readProject()
const { hasMta, srvPath } = project

if (hasMta) {
  const srv = registries.mta.srv4(srvPath)
  const postgres = {
    in: 'resources',
    where: { 'parameters.service': 'postgresql-db' }
  }
  await merge(__dirname, 'lib/add/mta.yml.hbs').into('mta.yaml', {
    project,
    additions: [srv, postgres, postgresDeployer],
    relationships: [
      ...
    ]
  })
}
```


### `mvn.add()` {.method}

For better Java support, plugins can easily invoke `mvn com.sap.cds:cds-maven-plugin:add` goals using `mvn.add`:

```js
async run() {
  const { isJava } = readProject()
  const { mvn } = cds.add
  if (isJava) await mvn.add('postgres')
}
```

## Checklist for Production

CAP projects allow for a high degree of freedom. Reason about the following questions for `cds add` plugin:

- ✅ Single- and Multitenancy
- ✅ Cloud Foundry (via MTA)
- ✅ Kyma (via Helm)

## Best Practices

Sticking to best practices established in CAP-provided plugins ensures your user’s experience a seamless integration.

### Consider `cds add` vs `cds build` {.good}

In contrast to `cds build`, `cds add` is concerned with source files outside of your _gen_ folder. Common examples are deployment descriptors such as _mta.yaml_ for Cloud Foundry or _values.yaml_ for Kyma deployment. Unlike generated files, those are usually checked in to your version control system.

### Embrace grow-as-you-go and separate concerns{.good}

A strength of `cds add` is the gradual increase in project complexity. All-in-the-box templates pose the danger of bringing maintainability and cost overhead by adding stuff you might not need. Decrease dependencies between plugins wherever possible.

### Embrace out-of-the-box{.good}

From a consumer point of view, your plugin is integrated by adding it to the _package.json_ `dependencies` and provides sensible default configuration without further modfication.

### Don't do too much work in `cds add` {.bad}

Consider generating the files in a `cds build` plugin instead. If your `cds add` plugin creates or modifies a large number of files, this can be incidental for high component coupling. Check if configuration for your service can be simplified and provide sensible defaults.

<!-- // TODO:

- Helm cap-operator plugin
  - Should they handle all facets (event mesh, xsuaa, mtx etc.) ...
  - ... or should the event mesh, xsuaa, mtx etc. files handle Helm deployments?
  - both are possible -->

