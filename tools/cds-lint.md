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

For all other projects of if you would like to have ESLint running within your VS Code editor, please run the dedicated [`cds add` commmand](#cds-add-lint) command to configure them.

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
-->



### ESLint CLI (optional) {#usage-eslint-cli}

To have more control over the linting process, you can also access the CDS ESLint plugin natively via the [ESLint CLI](https://eslint.org/docs/user-guide/command-line-interface). To determine the proper command line options, it can help to refer to output of the equivalent call using the [CDS Lint CLI](#usage-lint-cli) with `DEBUG="lint"`, which shows all of the options and flags applied:

```sh
DEBUG="lint" cds lint .
```

<pre class="log">
Linting:
<span><em>[lint] - eslint --ext ".cds,.csn,.csv" ...</em></span>
</pre>


### CDS configuration helper (optional) {#cds-add-lint}

The following command automatically adds the settings for the ESLint VS Code extension to the project's VS Code settings, installs the CDS ESLint plugin, and adds it to the ESLint configuration of your project:

```sh
cds add lint
```

Given that either a _package.json_, _pom.xml_, or _.cdsrc.json_ file is found, a prompt appears on whether to install the ESLint dependencies:

<pre class="log">

<span><em>Adding feature 'lint'...

Successfully added features to your project.


Almost done - you are missing 2 npm dependencies:

(1) ESLint v>=7.0.0
(2) ESLint plugin for CDS


Install dependencies now ? [y/n] y</em></span>

Successfully added features to your project.
</pre>

Once confirmed, this will install ESLint, the CDS plugin, as well as add the corresponding configuration for the CDS recommended rules into your project.


### CDS Lint in VS Code (optional)  {#cds-lint-vscode}

To turn on Lint checking your VS Code Editor, follow the steps below:

1. Download the [VS Code ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) for _Visual Studio Code_. CDS Lint seamlessly integrates with it. For _SAP Business Application Studio_ this is preinstalled.

2. Run the dedicated [`cds add` commmand](#cds-add-lint).
