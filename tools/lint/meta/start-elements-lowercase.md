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

# start-elements-lowercase

## Rule Details

Regular element names should start with lowercase letters.

### Examples

::: code-group
<<< ../examples/start-elements-lowercase/correct/schema.cds#snippet{ts:line-numbers} [✅ &nbsp; Correct example]
:::
<PlaygroundBadge
  name="start-elements-lowercase"
  kind="correct"
  :rules="{'@sap/cds/start-elements-lowercase': ['warn']}"
  :files="['schema.cds']"
/>

<br>

::: code-group
<<< ../examples/start-elements-lowercase/incorrect/schema.cds#snippet{ts:line-numbers} [❌ &nbsp; Incorrect example]
:::
<PlaygroundBadge
  name="start-elements-lowercase"
  kind="incorrect"
  :rules="{'@sap/cds/start-elements-lowercase': ['warn']}"
  :files="['schema.cds']"
/>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 1.0.4`.

<!--
### Resources
[Rule source](https://github.tools.sap/cap/eslint-plugin-cds/tree/main/lib/rules/start-elements-lowercase.js)
-->
