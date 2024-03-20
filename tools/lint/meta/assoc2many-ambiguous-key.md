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

# assoc2many-ambiguous-key

## Rule Details

Ambiguous key with a `TO MANY` relationship since entries could appear multiple times with the same key.

### Examples

::: code-group
<<< ../examples/assoc2many-ambiguous-key/correct/schema.cds#snippet{ts:line-numbers} [✅ &nbsp; Correct example]
:::
<PlaygroundBadge
  name="assoc2many-ambiguous-key"
  kind="correct"
  :rules="{'@sap/cds/assoc2many-ambiguous-key': ['error', 'show']}"
  :files="['schema.cds']"
/>

::: code-group
<<< ../examples/assoc2many-ambiguous-key/incorrect/schema.cds#snippet{ts:line-numbers} [❌ &nbsp; Incorrect example]
:::
<PlaygroundBadge
  name="assoc2many-ambiguous-key"
  kind="incorrect"
  :rules="{'@sap/cds/assoc2many-ambiguous-key': ['error', 'show']}"
  :files="['schema.cds']"
/>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 1.0.1`.

<!--
### Resources
[Rule source](https://github.tools.sap/cap/eslint-plugin-cds/tree/main/lib/rules/assoc2many-ambiguous-key.js)
-->
