import * as fs from 'fs'
// @ts-ignore
import * as plugin from '@sap/eslint-plugin-cds'

export default {
  load() {
    const data: any = []
    const allRules = Object.keys(plugin?.configs.all.rules);

    allRules.forEach((rule: string) => {
      rule = rule.replace('@sap/cds/', '');
      const description = plugin?.rules[rule]?.meta.docs.description;
      const hasRuleDocs = fs.existsSync(`./tools/lint/rules/${rule}.md`)
      const url = hasRuleDocs ? `./lint/rules/${rule}` : null //plugin?.rules[rule]?.meta.docs.url;
      const isRecommended = plugin?.rules[rule]?.meta.docs.recommended ? '✅' : '';
      const hasFix = plugin?.rules[rule]?.meta.fixable ? '🔧' : '';
      const hasSuggestions = plugin?.rules[rule]?.meta.hasSuggestions ? '💡' : '';
      
      data.push({ rule, description, url, isRecommended, hasFix, hasSuggestions })
    })
    return data;
  }
}