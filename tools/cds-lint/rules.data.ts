import * as fs from 'fs'
import * as path from 'path'

export default {
  async load() {
    const data: any = { "Model Validation": [], "Environment": [] };
    let plugin: any;
    try {
      // @ts-ignore
      plugin = (await import('@sap/eslint-plugin-cds')).default;
    } catch (e) {
      return data
    }
    const allRules = Object.keys(plugin.configs.all.rules).sort();

    allRules.forEach((rule: string) => {
      rule = rule.replace('@sap/cds/', '');
      const description = md2Html(plugin.rules[rule]?.meta.docs.description);
      const ruleDocs = path.join(__dirname, `meta/${rule}.md`)
      const hasRuleDocs = fs.existsSync(ruleDocs)
      const url = hasRuleDocs ? `./meta/${rule}` : null
      const isRecommended = plugin.rules[rule]?.meta.docs.recommended ? '✅' : '';
      const hasFix = plugin.rules[rule]?.meta.fixable ? '🔧' : '';
      const hasSuggestions = plugin.rules[rule]?.meta.hasSuggestions ? '💡' : '';
      const model = plugin.rules[rule]?.meta?.model === 'parsed' ? '👀' : '';
      const category = plugin.rules[rule]?.meta?.model === 'none' ? "Environment" : "Model Validation";
      data[category].push({ rule, description, url, isRecommended, hasFix, hasSuggestions, model })
    })
    return data;
  }

}

function md2Html(string:string='') {
  return string
    // @ts-ignore
    .replaceAll(/`(.*?)`/g, '<code>$1</code>')
    .replaceAll(/(https?:\/\/.*?)(\s)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>$2')
}
