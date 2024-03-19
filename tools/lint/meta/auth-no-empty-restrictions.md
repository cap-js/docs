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

# auth-no-empty-restrictions

## Rule Details

'`@restrict` and `@requires` must not be empty.

### Examples

::: code-group
<<< @/@external/tools/lint/examples/auth-no-empty-restrictions_correct.cds#snippet{ts:line-numbers} [✅ Correct example]
:::
<PlaygroundBadge
  name="auth-no-empty-restrictions"
  kind="correct"
  :rules="{'@sap/cds/auth-no-empty-restrictions': ['warn', 'show']}"
/>

::: code-group
<<< @/@external/tools/lint/examples/auth-no-empty-restrictions_incorrect.cds#snippet{ts:line-numbers} [❌ Incorrect example]
:::
<PlaygroundBadge
  name="auth-no-empty-restrictions"
  kind="incorrect"
  :rules="{'@sap/cds/auth-no-empty-restrictions': ['warn', 'show']}"
/>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.4.1`.

<!--
### Resources
[Rule source](https://github.tools.sap/cap/eslint-plugin-cds/tree/main/lib/rules/auth-no-empty-restrictions.js)
-->