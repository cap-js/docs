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

# no-join-on-draft

## Rule Details

Draft-enabled entities shall not be used in views that make use of `JOIN`. This rule will report a warning for any violations.

## Examples

#### ✅ &nbsp; Correct example

In the following example, no draft-enabled entities are used in the service `CatalogService`:

::: code-group
<<< ../examples/no-join-on-draft/correct/srv/cat-service.cds#snippet{cds:line-numbers} [srv/cat-service.cds]
:::
<PlaygroundBadge
  name="no-join-on-draft"
  kind="correct"
  :rules="{'@sap/cds/no-join-on-draft': ['warn', 'show']}"
  :files="['db/schema.cds', 'srv/cat-service.cds']"
/>

#### ❌ &nbsp; Incorrect example

In the next example, the service `CatalogService` uses a draft-enabled entity and makes use of `JOIN`, which violates the rule:

::: code-group
<<< ../examples/no-join-on-draft/incorrect/srv/cat-service.cds#snippet{cds:line-numbers} [srv/cat-service.cds]
:::
<PlaygroundBadge
  name="no-join-on-draft"
  kind="incorrect"
  :rules="{'@sap/cds/no-join-on-draft': ['warn', 'show']}"
  :files="['db/schema.cds', 'srv/cat-service.cds']"
/>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.2.1`.