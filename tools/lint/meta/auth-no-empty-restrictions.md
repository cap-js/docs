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

`@restrict` and `@requires` must not be empty.

### Examples

::: code-group
<<< ../examples/auth-no-empty-restrictions/correct/schema.cds#snippet{ts:line-numbers} [✅ &nbsp; Correct example]
:::
<PlaygroundBadge
  name="auth-no-empty-restrictions"
  kind="correct"
  :rules="{'@sap/cds/auth-no-empty-restrictions': ['error', 'show']}"
  :files="['schema.cds']"
/>

::: code-group
<<< ../examples/auth-no-empty-restrictions/incorrect/schema.cds#snippet{ts:line-numbers} [❌ &nbsp; Incorrect example]
:::
<PlaygroundBadge
  name="auth-no-empty-restrictions"
  kind="incorrect"
  :rules="{'@sap/cds/auth-no-empty-restrictions': ['error', 'show']}"
  :files="['schema.cds']"
/>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 1.0.1`.

<!--
### Resources
[Rule source](https://github.tools.sap/cap/eslint-plugin-cds/tree/main/lib/rules/auth-no-empty-restrictions.js)
-->
