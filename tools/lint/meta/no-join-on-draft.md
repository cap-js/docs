---
editLink: false
outline: [2,2]
breadcrumbs:
  - CDS Lint
    - Rules Reference
status: released
---

<style>
.vp-code {
  overflow-x: hidden !important;
}
</style>

<script setup>
  import PlaygroundBadge from '../../../.vitepress/theme/components/PlaygroundBadge.vue'
</script>

# no-join-on-draft

## Rule Details

Draft-enabled entities shall not be used in views that make use of `JOIN`.

### Examples

::: code-group
<<< ../examples/no-join-on-draft/correct/schema.cds#snippet{ts:line-numbers} [✅ &nbsp; Correct example]
:::
<PlaygroundBadge
  name="no-join-on-draft"
  kind="correct"
  :rules="{'@sap/cds/no-join-on-draft': ['warn', 'show']}"
  :files="['schema.cds']"
/>

<br>

::: code-group
<<< ../examples/no-join-on-draft/incorrect/schema.cds#snippet{ts:line-numbers} [❌ &nbsp; Incorrect example]
:::
<PlaygroundBadge
  name="no-join-on-draft"
  kind="incorrect"
  :rules="{'@sap/cds/no-join-on-draft': ['warn', 'show']}"
  :files="['schema.cds']"
/>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.2.1`.

<!--
### Resources
[Rule source](https://github.tools.sap/cap/eslint-plugin-cds/tree/main/lib/rules/no-join-on-draft.js)
-->
