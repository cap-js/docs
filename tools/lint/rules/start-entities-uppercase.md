---
editLink: false
outline: [2,2]
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
<<< @/tools/lint/examples/start-entities-uppercase_correct.cds#snippet{ts:line-numbers} [Correct example]
:::
<PlaygroundBadge
  name="start-entities-uppercase"
  kind="correct"
  :rules="{'@sap/cds/start-entities-uppercase': 'warn'}"
/>

Some more text...

::: code-group
<<< @/tools/lint/examples/start-entities-uppercase_incorrect.cds#snippet{ts:line-numbers} [Incorrect example]
:::
<PlaygroundBadge
  name="start-entities-uppercase"
  kind="incorrect"
  :rules="{'@sap/cds/start-entities-uppercase': 'warn'}"
/>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 1.0.4`.

<!--
### Resources
[Rule source](https://github.tools.sap/cap/eslint-plugin-cds/tree/main/lib/rules/start-entities-uppercase.js)
-->