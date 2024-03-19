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

According to our [best practices for naming convetions](../../../guides/domain-modeling#naming-conventions) in CDS models, regular entity names should start with uppercase letters.

### Examples

The following example defines an entity `Books`, which is started on an uppercase letter so the rule is not triggered.

::: code-group
<<< ../examples/start-entities-uppercase_correct.cds#snippet{ts:line-numbers} [✅ Correct example]
:::
<PlaygroundBadge
  name="start-entities-uppercase"
  kind="correct"
  :rules="{'@sap/cds/start-entities-uppercase': 'warn'}"
/>

In the next example, the entity `books`is started on a lowercase letter and so the rule is violated.

::: code-group
<<< ../examples/start-entities-uppercase_incorrect.cds#snippet{ts:line-numbers} [❌ Incorrect example]
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