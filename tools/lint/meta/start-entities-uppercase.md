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

# start-entities-uppercase

## Rule Details

Regular entity names should start with uppercase letters.

### Examples

::: code-group
<<< ../examples/start-entities-uppercase/correct/schema.cds#snippet{ts:line-numbers} [✅ &nbsp; Correct example]
:::
<PlaygroundBadge
  name="start-entities-uppercase"
  kind="correct"
  :rules="{'@sap/cds/start-entities-uppercase': ['warn']}"
  :files="['schema.cds']"
/>

<br>

::: code-group
<<< ../examples/start-entities-uppercase/incorrect/schema.cds#snippet{ts:line-numbers} [❌ &nbsp; Incorrect example]
:::
<PlaygroundBadge
  name="start-entities-uppercase"
  kind="incorrect"
  :rules="{'@sap/cds/start-entities-uppercase': ['warn']}"
  :files="['schema.cds']"
/>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 1.0.4`.

<!--
### Resources
[Rule source](https://github.tools.sap/cap/eslint-plugin-cds/tree/main/lib/rules/start-entities-uppercase.js)
-->
