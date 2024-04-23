import * as fs from 'fs'
import * as path from 'path'

export default {
  async load() {
    const data: any = { "Model Validation": [], "Environment": [] };
    let plugin: any;
    try {
      // @ts-ignore
        plugin = await import('@sap/eslint-plugin-cds');
      } catch (e) {
        return data
      }
      const allRules = Object.keys(plugin?.configs.all.rules).sort();

      allRules.forEach((rule: string) => {
        rule = rule.replace('@sap/cds/', '');
        // TODO: Skip the min-node-version rule as it will be deprecated soon
        if (rule !== 'min-node-version') {
          const description = plugin?.rules[rule]?.meta.docs.description;
          const ruleDocs = path.join(__dirname, `meta/${rule}.md`)
          const hasRuleDocs = fs.existsSync(ruleDocs)
          const url = hasRuleDocs ? `./meta/${rule}` : null
          const isRecommended = plugin?.rules[rule]?.meta.docs.recommended ? '✅' : '';
          const hasFix = plugin?.rules[rule]?.meta.fixable ? '🔧' : '';
          const hasSuggestions = plugin?.rules[rule]?.meta.hasSuggestions ? '💡' : '';
          const model = plugin?.rules[rule]?.meta?.model === 'parsed' ? '👀' : '';
          const category = plugin?.rules[rule]?.meta?.model === 'none' ? "Environment" : "Model Validation";
          data[category].push({ rule, description, url, isRecommended, hasFix, hasSuggestions, model })
        }
      })
    return data;
  }
}