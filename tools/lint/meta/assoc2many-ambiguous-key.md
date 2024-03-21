---
editLink: false
outline: [2,2]
breadcrumbs:
  - CDS Lint
    - Rules Reference
status: released
---

<style>
.vp-code {
  overflow-x: hidden !important;
}
</style>

<script setup>
  import PlaygroundBadge from '../../../.vitepress/theme/components/PlaygroundBadge.vue'
</script>

# assoc2many-ambiguous-key

## Rule Details

In general an [association/composition to/of `MANY`](../../../cds/cdl#to-many-associations) that targets an entity without `ON` condition is not allowed (as it is an `n:1` relationship). Here, one should always specify an `ON` condition following the canonical expression pattern `<assoc>.<backlink> = $self`. The backlink can be any managed to-one association on the many side pointing back to the one side.

### Examples

#### ✅ &nbsp; Correct example

In the following example, we define a unique association from `Author` to each `Book` with a well defined `ON` condition and backlink, thus satisfying the rule's conditions:

::: code-group
<<< ../examples/assoc2many-ambiguous-key/correct/db/schema.cds#snippet{cds:line-numbers} [db/schema.cds]
:::
<PlaygroundBadge
  name="assoc2many-ambiguous-key"
  kind="correct"
  :rules="{'@sap/cds/assoc2many-ambiguous-key': ['error', 'show']}"
  :files="['db/schema.cds']"
/>

#### ❌ &nbsp; Incorrect example

If we extend this example by creating a `view` on `Author` with a key `ID` and the element `bookIDs` without an `ON` condition, the rule is triggered since the key is no longer unique as `bookIDs` leads to multiple entries:

::: code-group
<<< ../examples/assoc2many-ambiguous-key/incorrect/db/schema.cds#snippet{cds:line-numbers} [db/schema.cds]
:::
<PlaygroundBadge
  name="assoc2many-ambiguous-key"
  kind="incorrect"
  :rules="{'@sap/cds/assoc2many-ambiguous-key': ['error', 'show']}"
  :files="['db/schema.cds']"
/>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 1.0.1`.
