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

# auth-valid-restrict-grant

## Rule Details

The `grant` property of a `@restrict` privilege defines one or more events that the privilege applies. This rule checks for valid values of `@restrict.grant`, that is, all standard CDS events (such as `READ`, `CREATE`, `UPDATE`, and `DELETE`) on entities. It also reports a warning if all standard CDS events with write semantics (`CREATE`, `DELETE`, `UPDATE`, `UPSERT`) and `*` is a wildcard for all events are used to use the virutal event `WRITE` instead.

### Examples

#### ✅ &nbsp; Correct example

In the following example, `CatalogService.ListOfBooks` is restricted to the `READ` event for the `Viewer` role, which is a valid value for `@restrict.grant`:

::: code-group
<<< ../examples/auth-valid-restrict-grant/correct/srv/cat-service.cds#snippet{cds:line-numbers} [srv/cat-service.cds]
:::
<PlaygroundBadge
  name="auth-valid-restrict-grant"
  kind="correct"
  :rules="{'@sap/cds/auth-valid-restrict-grant': ['warn', 'show']}"
  :files="['db/schema.cds', 'srv/cat-service.cds']"
/>

#### ❌ &nbsp; Incorrect example

In the next example, the `@restrict.grant` has a typo in the event (i.e. `REAAD`instead of `READ`) for the `Viewer` role, which is not a valid value for `@restrict.grant` so the rule will report a warning:

::: code-group
<<< ../examples/auth-valid-restrict-grant/incorrect/srv/cat-service.cds#snippet{cds:line-numbers} [srv/cat-service.cds]
:::
<PlaygroundBadge
  name="auth-valid-restrict-grant"
  kind="incorrect"
  :rules="{'@sap/cds/auth-valid-restrict-grant': ['warn', 'show']}"
  :files="['db/schema.cds', 'srv/cat-service.cds']"
/>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.4.1`.