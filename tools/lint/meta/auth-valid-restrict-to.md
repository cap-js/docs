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

# auth-valid-restrict-to

## Rule Details

`@restrict.to` must have valid values.

### Examples

::: code-group
<<< ../examples/auth-valid-restrict-to/correct/schema.cds#snippet{ts:line-numbers} [✅ &nbsp; Correct example]
:::
<PlaygroundBadge
  name="auth-valid-restrict-to"
  kind="correct"
  :rules="{'@sap/cds/auth-valid-restrict-to': ['warn', 'show']}"
  :files="['schema.cds']"
/>

<br>

::: code-group
<<< ../examples/auth-valid-restrict-to/incorrect/schema.cds#snippet{ts:line-numbers} [❌ &nbsp; Incorrect example]
:::
<PlaygroundBadge
  name="auth-valid-restrict-to"
  kind="incorrect"
  :rules="{'@sap/cds/auth-valid-restrict-to': ['warn', 'show']}"
  :files="['schema.cds']"
/>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.4.1`.

<!--
### Resources
[Rule source](https://github.tools.sap/cap/eslint-plugin-cds/tree/main/lib/rules/auth-valid-restrict-to.js)
-->
