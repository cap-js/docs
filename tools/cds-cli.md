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
<style scoped>
  .ga   { color: var(--vp-c-green-2);}
  .na   { color: gray; font-size:90%; }
  .prog { color: var(--vp-c-green-3); font-size:90%; font-weight:500; }
  .plan { color: gray; font-size:90% }
  .contrib { color: gray; font-size:90% }
</style>

# CDS Command Line Interface (CLI) {#cli}

To use `cds` from your command line, install package  `@sap/cds-dk` globally:

```sh
npm i -g @sap/cds-dk
```

[[toc]]

## *cds version*

Use `cds version` to get information about your installed package version:

<pre class="log">
<span class="cwd">$</span> <span class="cmd">cds</span> <span class="args">version</span>

<em>@capire/samples:</em> 2.0.0
<em>@sap/cds:</em> 6.8.4
<em>@sap/cds-compiler:</em> 3.9.12
<em>@sap/cds-dk:</em> 7.9.1
<em>@sap/cds-dk (global):</em> 6.7.0
<em>@sap/cds-mtxs:</em> 1.7.1
<em>@sap/eslint-plugin-cds:</em> 2.6.3
<em>Node.js:</em> v18.13.0
<em>home:</em> .../node_modules/@sap/cds

<span class="cwd">$</span> <span class="cmd">cds</span> <span class="args">version</span> <span class="flags">--markdown</span>

| @capire/samples        | https://github.com/sap-samples/cloud-cap-samples.git |
|------------------------|------------------------------------------------------|
| Node.js                | v18.13.0                                             |
| @sap/cds               | 6.8.4                                                |
| @sap/cds-compiler      | 3.9.12                                               |
| @sap/cds-dk            | 7.9.1                                                |
| @sap/eslint-plugin-cds | 2.6.3                                                |
</pre>

## *cds completion* <Since version="7.9.0" of="@sap/cds-dk" />

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


## *cds help*

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



## *cds init*

Use `cds init` to create new projects.

## *cds add*

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
| `data`                        |       <X/>       |       <X/>       |
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
>

## *cds env*

Use `cds env` to inspect currently effective config settings:

<pre class="log">
<span class="cwd">$</span> <span class="cmd">cds</span> <span class="args">env get</span> <span class="flags">requires.db</span>
{
  impl: <em>'@sap/cds/libx/_runtime/sqlite/Service.js'</em>,
  credentials: { url: <em>':memory:'</em> },
  kind: <em>'sqlite'</em>
}
</pre>


## *cds repl*

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



