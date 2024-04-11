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
  import PlaygroundBadge from '../../../.vitepress/theme/components/PlaygroundBadge.vue'
</script>

# start-entities-uppercase

## Rule Details


According to our [naming conventions](../../../guides/domain-modeling#naming-conventions), to easily distinguish entity names from element names we recommend starting entity names with *capital* letters, which this rule ensures.

## Examples

#### ✅ &nbsp; Correct example

In the following example, the rule is satisfied because the entity name `Books` starts with a capital letter:

::: code-group
<<< ../examples/start-entities-uppercase/correct/db/schema.cds#snippet{cds:line-numbers} [db/schema.cds]
:::
<PlaygroundBadge
  name="start-entities-uppercase"
  kind="correct"
  :rules="{'@sap/cds/start-entities-uppercase': 'warn'}"
  :files="['db/schema.cds']"
/>

#### ❌ &nbsp; Incorrect example

In the next example, the rule reports a warning, because the entity name `books` starts with a lowercase letter:

::: code-group
<<< ../examples/start-entities-uppercase/incorrect/db/schema.cds#snippet{cds:line-numbers} [db/schema.cds]
:::
<PlaygroundBadge
  name="start-entities-uppercase"
  kind="incorrect"
  :rules="{'@sap/cds/start-entities-uppercase': 'warn'}"
  :files="['db/schema.cds']"
/>

## Version
This rule was introduced in `@sap/eslint-plugin-cds 1.0.4`.