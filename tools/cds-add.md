---
label: cds-add
synopsis: >
  Learn how to implement a `cds add` plugin.
# status: released
---

<style scoped>
.cols-2 {
  display: flex;
  flex-wrap: wrap;
}
.cols-2 > * {
  width: 100%;
}
@media (min-width: 640px) {
  .cols-2 {
    gap: 1em;
  }
  .cols-2 > * {
    flex: 1;
    width: calc(100% / 2);
  }
}

</style>

# Plugins for `cds add`{#cds-add}

`cds add` is a command to augment your project with additional configuration.

In contrast to `cds build`, it is concerned with source files outside of your _gen_ folder. Common examples are deployment descriptors such as _mta.yaml_ for Cloud Foundry or _values.yaml_ for Kyma deployment. Unlike generated files, those are usually checked in to your version control system.

[[toc]]

## Implement a Plugin from Scratch

Adding a
Likewise, running `cds add mta` with the Postgres plugin used in production should do the same augmentations.

::: code-group
```yaml [lib/add/mta.yaml.hbs]
modules:
  - name: {{appName}}-srv
    type: {{language}}
    path: {{& srvPath}}
    requires:
      - name: {{appName}}-postgres

  - name: {{appName}}-postgres-deployer
    type: nodejs
    path: gen/pg
    parameters:
      buildpack: nodejs_buildpack
      no-route: true
      no-start: true
      tasks:
        - name: deploy-to-postgresql
          command: npm start
    requires:
      - name: {{appName}}-postgres

resources:
  - name: {{appName}}-postgres
    type: org.cloudfoundry.managed-service
    parameters:
      service: postgresql-db
      service-plan: development
```
:::

In essence, `cds add` is a collection of those facets and a set of rules to merge them, specified by the respective plugins themselves.

## Plugin API

### `register(name, impl)` {.method}

Register a plugin for `cds add` by providing a name and plugin implementation:

::: code-group
```js [cds-plugin.js]
/* ... */

cds.add?.register?.('@cap-js/postgres',
  class PostgresTemplate extends cds.add.Plugin {
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
  const postgres = { in: 'resources', where: { 'parameters.service': 'postgresql-db' } }
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


## Best Practices

Sticking to best practices established in CAP-provided plugins ensures your user’s experience a seamless integration.

### Embrace grow-as-you-go{.good}

A strength of `cds add` is the gradual increase in project complexity. All-in-the-box templates pose the danger of bringing maintainability and cost overhead. Decrease dependencies between plugins wherever possible.

### Embrace out-of-the-box{.good}

Ideally your plugin is integrated by adding it to the _package.json_ `dependencies` and provides default configuration without further modfication.

### Don't do too much work in `cds add` {.bad}

Consider generating the files in a `cds build` plugin instead. If your `cds add` plugin creates or modifies a large number of files, this can be incidental for high component coupling. Check if configuration for your service can be simplified and provide sensible defaults.

<!-- // TODO:

- Helm cap-operator plugin
  - Should they handle all facets (event mesh, xsuaa, mtx etc.) ...
  - ... or should the event mesh, xsuaa, mtx etc. files handle Helm deployments?
  - both are possible -->

