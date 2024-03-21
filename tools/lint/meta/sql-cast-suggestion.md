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

# sql-cast-suggestion

## Rule Details

Should make suggestions for possible missing SQL casts.

### Examples

::: code-group
<<< ../examples/sql-cast-suggestion/correct/schema.cds#snippet{ts:line-numbers} [✅ &nbsp; Correct example]
:::
<PlaygroundBadge
  name="sql-cast-suggestion"
  kind="correct"
  :rules="{'@sap/cds/sql-cast-suggestion': ['warn', 'show']}"
  :files="['schema.cds']"
/>

<br>

::: code-group
<<< ../examples/sql-cast-suggestion/incorrect/schema.cds#snippet{ts:line-numbers} [❌ &nbsp; Incorrect example]
:::
<PlaygroundBadge
  name="sql-cast-suggestion"
  kind="incorrect"
  :rules="{'@sap/cds/sql-cast-suggestion': ['warn', 'show']}"
  :files="['schema.cds']"
/>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 1.0.8`.

<!--
### Resources
[Rule source](https://github.tools.sap/cap/eslint-plugin-cds/tree/main/lib/rules/sql-cast-suggestion.js)
-->
