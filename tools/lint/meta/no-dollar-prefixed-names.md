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

# no-dollar-prefixed-names

## Rule Details

Names must not start with $ to avoid possible shadowing of reserved variables.

### Examples

#### ✅ &nbsp; Correct example

In the following example, all elements names are well defined and do not start with `$`:

::: code-group
<<< ../examples/no-dollar-prefixed-names/correct/db/schema.cds#snippet{cds:line-numbers} [db/schema.cds]
:::
<PlaygroundBadge
  name="no-dollar-prefixed-names"
  kind="correct"
  :rules="{'@sap/cds/no-dollar-prefixed-names': ['warn', 'show']}"
  :files="['db/schema.cds']"
/>

#### ❌ &nbsp; Incorrect example

In the next example, the element `$pages` starts with `$` and so the rule will raise an error for this element:

::: code-group
<<< ../examples/no-dollar-prefixed-names/incorrect/db/schema.cds#snippet{cds:line-numbers} [db/schema.cds]
:::
<PlaygroundBadge
  name="no-dollar-prefixed-names"
  kind="incorrect"
  :rules="{'@sap/cds/no-dollar-prefixed-names': ['warn', 'show']}"
  :files="['db/schema.cds']"
/>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.3.3`.

<!--
### Resources
[Rule source](https://github.tools.sap/cap/eslint-plugin-cds/tree/main/lib/rules/no-dollar-prefixed-names.js)
-->
