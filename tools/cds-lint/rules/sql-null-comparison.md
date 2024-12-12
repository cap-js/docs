---
outline: [2,2]
breadcrumbs:
  - CDS Lint
    - Rules Reference
status: released
---

<script setup>
  import PlaygroundBadge from '../components/PlaygroundBadge.vue'
</script>

# sql-null-comparison

## Rule Details


Comparing values against `null` in views is a common pitfall in SQL.
This rules helps find places where incorrect SQL comparisons are used and proposes to use `IS NULL` or `IS NOT NULL` instead.

## Examples

#### ✅ &nbsp; Correct example

In the following example, the rule is satisfied because `null` comparison is valid:

::: code-group
<<< ../examples/sql-null-comparison/correct/srv/cat-service.cds#snippet{cds:line-numbers} [db/schema.cds]
:::
<PlaygroundBadge
  name="sql-null-comparison"
  kind="correct"
  :rules="{'@sap/cds/sql-null-comparison': 'warn'}"
  :files="['db/schema.cds']"
/>

#### ❌ &nbsp; Incorrect example

In the next example, the rule reports a warning, because the comparison `= null` is not correct:

::: code-group
<<< ../examples/sql-null-comparison/incorrect/srv/cat-service.cds#snippet{cds:line-numbers} [db/schema.cds]
:::
<PlaygroundBadge
  name="sql-null-comparison"
  kind="incorrect"
  :rules="{'@sap/cds/sql-null-comparison': 'warn'}"
  :files="['db/schema.cds']"
/>

## Version
This rule was introduced in `@sap/eslint-plugin-cds 3.1.0`.
