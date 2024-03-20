---
editLink: false
outline: [2,2]
breadcrumbs:
  - CDS Lint
    - Rules Reference
status: released
---

<script setup>
  import PlaygroundBadge from '../../../.vitepress/theme/components/PlaygroundBadge.vue'
</script>

# extension-restrictions

## Rule Details

Extensions must not violate restrictions set by the extended SaaS app.

### Examples

::: code-group
<<< ../examples/extension-restrictions/correct/schema.cds#snippet{ts:line-numbers} [✅ &nbsp; Correct example]
:::
<!--PlaygroundBadge
  name="extension-restrictions"
  kind="correct"
  :rules="{'@sap/cds/extension-restrictions': ['warn', 'show']}"
  :files="['schema.cds', 'node_modules/base-app/.cdsrc.json', 'node_modules/base-app/index.csn']"
  :packages="{'cds': { 'extends': 'base-app' } }"
/-->

::: code-group
<<< ../examples/extension-restrictions/incorrect/schema.cds#snippet{ts:line-numbers} [❌ &nbsp; Incorrect example]
:::
<!--PlaygroundBadge
  name="extension-restrictions"
  kind="incorrect"
  :rules="{'@sap/cds/extension-restrictions': ['warn', 'show']}"
  :files="['schema.cds', 'node_modules/base-app/.cdsrc.json', 'node_modules/base-app/index.csn']"
  :packages="{'cds': { 'extends': 'base-app' } }"
/-->

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.6.0`.

<!--
### Resources
[Rule source](https://github.tools.sap/cap/eslint-plugin-cds/tree/main/lib/rules/extension-restrictions.js)
-->
