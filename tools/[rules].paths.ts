// This script creates a Markdown document from the CDS Lint Rules Reference.
// It uses VitePress' dynamic routing to create a single page.
// See https://vitepress.dev/guide/routing#dynamic-routes for how this works

export default {
  async paths() {
    const content = await getRules()
    return [{ // we always just return one entry
      params: { 'rules': 'rules' }, // must match to file name
      content // raw MD
    }]
  }
}


async function getRules() {
  try {
    // @ts-ignore
    await import('@sap/eslint-plugin-cds');

    console.debug('Reading CDS Lint sources...')
    let result = `Below you can find all rules in the \`@sap/eslint-plugin-cds\` ESLint plugin.
    
They are grouped by categories [Model Validation](#model-validation) and [Environment](#environment) to help you understand their purpose.

Your standard CDS project configuration turns on a subset of these rules by default, namely the *recommended*
(&nbsp;✅&nbsp;) rules to ensure basic standards are met.

## Model Validation

Model Validation rules are used to validate CDS models within projects.
They are used to enforce security, naming conventions, or other best practices.

Note, that while all recommended (&nbsp;✅&nbsp;) model rules run with the CLI, only a number of them are
enabled and visible in the editor by default (&nbsp;👀&nbsp;).
::: details
* *In Editor* rules: Rules that are enabled in the editor by default only rely on the current file as their rule context. These are quick to execute and
can react on file changes.
* *Project-based* rules: Rules that are disabled in the editor by default usually rely on a series of (project) files for their rule context or include
slow or expensive processes. These are slow to execute and only run with the CLI. 
:::

> [!TIP]
> ✅ &nbsp; **Recommeded**: If the plugin's *recommended* configuration enables the rule<br>
> 🔧 &nbsp; **Fixable**: If problems reported by the rule are automatically fixable (\`--fix\`)<br>
> 💡 &nbsp; **Has Suggestions**: If problems reported by the rule are manually fixable<br>
> 👀 &nbsp; **In Editor**: If the rule is shown in the VS Code editor and rerun on file changes

<RulesRefTable category="Model Validation"/>

## Environment

Environment rules are used to check for proper and up-to-date CDS project environments.
These are only run via the command line and are not available in the editor as they often can't be
pinpointed to any particular file.

> [!TIP]
> ✅ &nbsp; **Recommeded**: If the plugin's *recommended* configuration enables the rule<br>
> 🔧 &nbsp; **Fixable**: If problems reported by the rule are automatically fixable (\`--fix\`)<br>
> 💡 &nbsp; **Has Suggestions**: If problems reported by the rule are manually fixable (editor)

<RulesRefTable category="Environment"/>`

    return result
  } catch (e) {
    return `::: danger No content here
You need install the CDS ESLint plugin locally to see data here:
\`\`\`sh
npm i --no-save @sap/eslint-plugin-cds
\`\`\`
The CI does that in production.`
  }
}
