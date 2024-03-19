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
  
For more information or examples on a particular rule, simply click on the rule of interest to navigate to its details page.
  
> [!TIP]
> Rules in ESLint are grouped by type to help you understand their purpose:
> * ✅  **Recommeded**: If the plugin's *recommended* configuration enables the rule
> * 🔧  **Fixable**: If problems reported by the rule are automatically fixable (--fix)
> * 💡  **Has Suggestions**: If problems reported by the rule are manually fixable (editor)

<RulesRefTable/>`

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
