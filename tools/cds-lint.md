---
label: cds-lint
synopsis: >
  This page explains the ESLint plugin for CDS in depth.
status: released
---

# CDS Lint


<style lang="scss" scoped>
  .cols-2 {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
  @media (min-width: 640px) {
    .cols-2 {
      gap: 2em;
    }
    .cols-2 > * {
      &:first-child {
        flex: 1;
      }
    }
  }
</style>

<div class="cols-2">

<div>

To catch issues in CDS models and the CDS environment early, CAP provides an [ESLint plugin](https://eslint.org/) for CDS [`@sap/eslint-plugin-cds`](https://www.npmjs.com/package/@sap/eslint-plugin-cds) with a set of *recommended* rules that are considered best practice and universal for every CAP project. This plugin, together with the [`cds lint` CLI](#usage-lint-cli) of [`@sap/cds-dk`](https://www.npmjs.com/package/@sap/cds-dk), comprises what we call **CDS Lint**.

</div>

<div>

<img src="./assets/cdslint.svg" alt="ESLint plugin for CDS logo" width="130px" class="ignore-dark" />

</div>

</div>

By nature of its design, the plugin can also be run with the [ESLint CLI](#usage-eslint-cli). However, we recommended using the [CDS Lint CLI](#usage-lint-cli) instead as it comes with all preconfigured settings.



### CDS Lint Configuration {#cds-lint-config}

All CDS projects initiated with `cds init` come with CDS Lint preconfigured. **No setup is needed**.

For all other projects, you would like to have ESLint running within your VS Code editor. Run the dedicated [`cds add` commmand](#cds-add-lint) command to configure them.

> [!TIP]
> To add lint checking to your VS Code Editor, follow the setup in [CDS Lint in VSCode](#cds-lint-vscode).



### CDS Lint CLI {#usage-lint-cli}

In your project's root folder, execute:

```sh
cds lint .
```

It follows standard ESLint behaviour. If there are no lint errors, there is no output. If there are, a standard ESLint error report will be printed.



### CDS Lint Rules

The **CDS Lint** rules are a set of generic rules based on CAP best practices. 

[See our Rules Reference page to find out more](rules){ .learn-more}



<!--
### CDS Lint Customization  {#cds-lint-customization}

#### Configuring CDS Lint Rules

Individual package rules can also be [configured](https://eslint.org/docs/user-guide/configuring/rules#configuring-rules) to be turned off or have a different severity. For example, if you want to turn off the recommended *environment* rule [min-node-version](../tools/lint/rules#min-node-version), just add the following lines to your [ESLint configuration file](https://eslint.org/docs/user-guide/configuring/), shown here for type `json`:

```json
{
  "rules": {
    "@sap/cds/min-node-version": 0
  }
}
```

### Configuring custom CDS Lint Rules

To include your own custom rules, prepare your project configuration once with:

```sh
cds add lint
```

This configures your project to use the `@sap/eslint-plugin-cds` locally and create an extra _.eslint_ directory for your custom rules, tests, and documentation:

 - _rules_: Directory for your custom rules.
 - _tests_: Directory for your custom rules tests.
 - _docs_: Directory for auto-generated docs based on your custom rules and any valid/invalid test cases provided,

Add a sample custom rule:

```sh
cds add lint:dev
```

The following sample rule is added to your configuration file:

```json
{
  "rules": {
    "no-entity-moo": 2
  }
}
```

To test the rule, just add a _.cds_ file, for example _moo.cds_, with the following content to your project:

```cds
entity Moo {}
```

Run the linter (`cds lint .`) to see that an entity called `Moo` is not allowed.
Ideally, if you are using an editor together with an ESLint extension, you will already be notified of this when you save the file.

To quickly unit-test a custom rule, you can find a sample _no-entity-moo.test.js_ in _.eslint/tests_. To run the test:

```sh
mocha .eslint/tests/no-entity-moo
```

-->



### ESLint CLI (optional) {#usage-eslint-cli}

To have more control over the linting process, you can also access the CDS ESLint plugin natively via the [ESLint CLI](https://eslint.org/docs/user-guide/command-line-interface). To determine the proper command line options, it can help to refer to output of the equivalent call using the [CDS Lint CLI](#usage-lint-cli) with `DEBUG="lint"`, which shows all of the options and flags applied:

```sh
DEBUG=lint cds lint .
```

<pre class="log">
Linting:
<span>[lint] - eslint --ext ".cds,.csn,.csv" ...</span>
</pre>


### CDS configuration helper (optional) {#cds-add-lint}

The following command automatically adds settings for the ESLint VS Code extension to the project's VS Code settings, installs the CDS ESLint plugin, and adds it to the ESLint configuration of your project:

```sh
cds add lint
```

<pre class="log">

Adding feature 'lint'...

Successfully added features to your project.


<span>Almost done - <text style="color: orange">you are missing 2 npm dependencies</text>:</span>

(1) ESLint v>=7.0.0
(2) ESLint plugin for CDS


<text style="color: orange">Install dependencies now</text>? [y/n] y

Successfully added features to your project.
</pre>

Given that either a _package.json_, _pom.xml_, or _.cdsrc.json_ file is found, a prompt appears on whether to install the ESLint dependencies. Once confirmed, this will install ESLint, the CDS plugin, as well as add the corresponding configuration for the CDS recommended rules into your project.


### CDS Lint in VS Code (optional)  {#cds-lint-vscode}

To turn on Lint checking your VS Code Editor, follow the steps below:

1. Download the [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) for _Visual Studio Code_. CDS Lint seamlessly integrates with it. For _SAP Business Application Studio_ this comes preinstalled.

2. Run the dedicated [`cds add` commmand](#cds-add-lint).
