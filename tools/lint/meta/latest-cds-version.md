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

# latest-cds-version

## Rule Details

`@restrict.where` must have valid values.

### Examples

::: code-group
<<< ../examples/latest-cds-version/correct/package.json#snippet{ts:line-numbers} [✅ &nbsp; Correct example]
:::

::: code-group
<<< ../examples/latest-cds-version/incorrect/package.json#snippet{ts:line-numbers} [❌ &nbsp; Incorrect example]
:::


### Version
This rule was introduced in `@sap/eslint-plugin-cds 1.0.4`.

<!--
### Resources
[Rule source](https://github.tools.sap/cap/eslint-plugin-cds/tree/main/lib/rules/latest-cds-version.js)
-->
