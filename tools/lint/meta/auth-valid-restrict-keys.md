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

# auth-valid-restrict-keys

## Rule Details

`@restrict` must have properly spelled `to`, `grant`, and `where` keys.

### Examples

::: code-group
<<< ../examples/auth-valid-restrict-keys/correct/schema.cds#snippet{ts:line-numbers} [✅ &nbsp; Correct example]
:::
<PlaygroundBadge
  name="auth-valid-restrict-keys"
  kind="correct"
  :rules="{'@sap/cds/auth-valid-restrict-keys': ['warn', 'show']}"
  :files="['schema.cds']"
/>

<br>

::: code-group
<<< ../examples/auth-valid-restrict-keys/incorrect/schema.cds#snippet{ts:line-numbers} [❌ &nbsp; Incorrect example]
:::
<PlaygroundBadge
  name="auth-valid-restrict-keys"
  kind="incorrect"
  :rules="{'@sap/cds/auth-valid-restrict-keys': ['warn', 'show']}"
  :files="['schema.cds']"
/>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.4.1`.

<!--
### Resources
[Rule source](https://github.tools.sap/cap/eslint-plugin-cds/tree/main/lib/rules/auth-valid-restrict-keys.js)
-->
