// see https://vitepress.dev/guide/routing#dynamic-routes for how this works
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
    
They are grouped by type, *Model Validation* or *Environment* to help you understand their purpose.

## Model Validation

> [!TIP]
> ✅ &nbsp; **Recommeded**: If the plugin's *recommended* configuration enables the rule<br>
> 🔧 &nbsp; **Fixable**: If problems reported by the rule are automatically fixable (--fix)<br>
> 💡 &nbsp; **Has Suggestions**: If problems reported by the rule are manually fixable (editor)
> ♻️ &nbsp; **Parsed Model**: If the rule is shown and rerun on file changes (editor)

<RulesRefTable category="Model Validation"/>

## Environment

> [!TIP]
> ✅ &nbsp; **Recommeded**: If the plugin's *recommended* configuration enables the rule<br>
> 🔧 &nbsp; **Fixable**: If problems reported by the rule are automatically fixable (--fix)<br>
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
