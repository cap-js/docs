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

# no-db-keywords

## Rule Details

Avoid using reserved SQL keywords.

### Examples

::: code-group
<<< ../examples/no-db-keywords/correct/schema.cds#snippet{ts:line-numbers} [✅ &nbsp; Correct example]
:::
<PlaygroundBadge
  name="no-db-keywords"
  kind="correct"
  :rules="{'@sap/cds/no-db-keywords': ['warn', 'show']}"
  :files="['schema.cds']"
/>

::: code-group
<<< ../examples/no-db-keywords/incorrect/schema.cds#snippet{ts:line-numbers} [❌ &nbsp; Incorrect example]
:::
<PlaygroundBadge
  name="no-db-keywords"
  kind="incorrect"
  :rules="{'@sap/cds/no-db-keywords': ['warn', 'show']}"
  :files="['schema.cds']"
/>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.1.0`.

<!--
### Resources
[Rule source](https://github.tools.sap/cap/eslint-plugin-cds/tree/main/lib/rules/no-db-keywords.js)
-->
