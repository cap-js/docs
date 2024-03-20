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

# valid-csv-header

## Rule Details

CSV files for entities must refer to valid element names.

### Examples

::: code-group
<<< ../examples/valid-csv-header/correct/services.cds#snippet{ts:line-numbers} [✅ &nbsp; Correct example]
:::
<PlaygroundBadge
  name="valid-csv-header"
  kind="correct"
  :rules="{'@sap/cds/valid-csv-header': ['warn']}"
  :files="['services.cds', 'my.bookshop-Books.csv']"
/>

::: code-group
<<< ../examples/valid-csv-header/incorrect/services.cds#snippet{ts:line-numbers} [❌ &nbsp; Incorrect example]
:::
<PlaygroundBadge
  name="valid-csv-header"
  kind="incorrect"
  :rules="{'@sap/cds/valid-csv-header': ['warn']}"
  :files="['services.cds', 'my.bookshop-Books.csv']"
/>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.3.0`.

<!--
### Resources
[Rule source](https://github.tools.sap/cap/eslint-plugin-cds/tree/main/lib/rules/valid-csv-header.js)
-->
