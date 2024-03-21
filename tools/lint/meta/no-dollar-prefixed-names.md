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

# no-dollar-prefixed-names

## Rule Details

Names must not start with $ to avoid possible shadowing of reserved variables.

### Examples

::: code-group
<<< ../examples/no-dollar-prefixed-names/correct/schema.cds#snippet{ts:line-numbers} [✅ &nbsp; Correct example]
:::
<PlaygroundBadge
  name="no-dollar-prefixed-names"
  kind="correct"
  :rules="{'@sap/cds/no-dollar-prefixed-names': ['warn', 'show']}"
  :files="['schema.cds']"
/>

<br>

::: code-group
<<< ../examples/no-dollar-prefixed-names/incorrect/schema.cds#snippet{ts:line-numbers} [❌ &nbsp; Incorrect example]
:::
<PlaygroundBadge
  name="no-dollar-prefixed-names"
  kind="incorrect"
  :rules="{'@sap/cds/no-dollar-prefixed-names': ['warn', 'show']}"
  :files="['schema.cds']"
/>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.3.3`.

<!--
### Resources
[Rule source](https://github.tools.sap/cap/eslint-plugin-cds/tree/main/lib/rules/no-dollar-prefixed-names.js)
-->
