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

Regular entity names should start with uppercase letters.

### Examples

::: code-group
<<< ../examples/start-elements-lowercase_correct.cds#snippet{ts:line-numbers} [✅ Correct example]
:::
<PlaygroundBadge
  name="start-elements-lowercase"
  kind="correct"
  :rules="{'@sap/cds/start-elements-lowercase': 'warn'}"
/>

::: code-group
<<< ../examples/start-elements-lowercase_incorrect.cds#snippet{ts:line-numbers} [❌ Incorrect example]
:::
<PlaygroundBadge
  name="start-elements-lowercase"
  kind="incorrect"
  :rules="{'@sap/cds/start-elements-lowercase': 'warn'}"
/>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 1.0.4`.

<!--
### Resources
[Rule source](https://github.tools.sap/cap/eslint-plugin-cds/tree/main/lib/rules/start-elements-lowercase.js)
-->