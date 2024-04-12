---
editLink: false
outline: [2,2]
breadcrumbs:
  - CDS Lint
    - Rules Reference
prev: false
next: false
status: released
---

<script setup>
  import PlaygroundBadge from '../components/PlaygroundBadge.vue'
</script>

# start-elements-lowercase

## Rule Details

According to our [naming conventions](../../../guides/domain-modeling#naming-conventions), to easily distinguish entity names from element names we recommend starting elements with a *lowercase* letter, which this rule ensures.

## Examples

#### ✅ &nbsp; Correct example

In the following example, the rule is satisfied because the element name `title` starts with a lowercase letter:

::: code-group
<<< ../examples/start-elements-lowercase/correct/db/schema.cds#snippet{cds:line-numbers} [db/schema.cds]
:::
<PlaygroundBadge
  name="start-elements-lowercase"
  kind="correct"
  :rules="{'@sap/cds/start-elements-lowercase': 'warn'}"
  :files="['schema.cds']"
/>

#### ❌ &nbsp; Incorrect example

In the next example, the rule will report a warning, because the element name `Title` starts with an uppercase letter:

::: code-group
<<< ../examples/start-elements-lowercase/incorrect/db/schema.cds#snippet{ts:line-numbers} [db/schema.cds]
:::
<PlaygroundBadge
  name="start-elements-lowercase"
  kind="incorrect"
  :rules="{'@sap/cds/start-elements-lowercase': 'warn'}"
  :files="['db/schema.cds']"
/>

## Version
This rule was introduced in `@sap/eslint-plugin-cds 1.0.4`.