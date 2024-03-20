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

# min-node-version

## Rule Details

`@restrict.where` must have valid values.

### Examples

::: code-group
<<< ../examples/min-node-version/correct/schema.cds#snippet{ts:line-numbers} [✅ &nbsp; Correct example]
:::
<PlaygroundBadge
  name="min-node-version"
  kind="correct"
  :rules="{'@sap/cds/min-node-version': ['error', 'show']}"
  :files="['schema.cds']"
/>

::: code-group
<<< ../examples/min-node-version/incorrect/schema.cds#snippet{ts:line-numbers} [❌ &nbsp; Incorrect example]
:::
<PlaygroundBadge
  name="min-node-version"
  kind="incorrect"
  :rules="{'@sap/cds/min-node-version': ['error', 'show']}"
  :files="['schema.cds']"
/>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 1.0.0`.

<!--
### Resources
[Rule source](https://github.tools.sap/cap/eslint-plugin-cds/tree/main/lib/rules/min-node-version.js)
-->
