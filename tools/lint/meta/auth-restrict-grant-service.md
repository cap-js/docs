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

# auth-restrict-grant-service

## Rule Details

`@restrict.grant` on service level and for bound/unbound actions and functions is limited to `grant: '*'`.

### Examples

::: code-group
<<< ../examples/auth-restrict-grant-service/correct/schema.cds#snippet{ts:line-numbers} [✅ &nbsp; Correct example]
:::
<PlaygroundBadge
  name="auth-restrict-grant-service"
  kind="correct"
  :rules="{'@sap/cds/auth-restrict-grant-service': ['error', 'show']}"
  :files="['schema.cds']"
/>

::: code-group
<<< ../examples/auth-restrict-grant-service/incorrect/schema.cds#snippet{ts:line-numbers} [❌ &nbsp; Incorrect example]
:::
<PlaygroundBadge
  name="auth-restrict-grant-service"
  kind="incorrect"
  :rules="{'@sap/cds/auth-restrict-grant-service': ['error', 'show']}"
  :files="['schema.cds']"
/>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.6.4`.

<!--
### Resources
[Rule source](https://github.tools.sap/cap/eslint-plugin-cds/tree/main/lib/rules/auth-restrict-grant-service.js)
-->
