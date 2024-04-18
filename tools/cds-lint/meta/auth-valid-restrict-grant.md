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

# auth-valid-restrict-grant

## Rule Details

The `grant` property of a `@restrict` privilege defines one or more events that the privilege applies. This rule checks for valid values of `@restrict.grant`, that is, all standard CDS events (such as `READ`, `CREATE`, `UPDATE`, and `DELETE`) on entities. It also suggests to use `*` only when listing events including `*` and to use `WRITE` only when using solely standard CDS events with write semantics (`CREATE`, `DELETE`, `UPDATE`, `UPSERT`).

## Examples

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

In the next example, the `@restrict.grant` has a typo in the event (that is, `REAAD` instead of `READ`) for the `Viewer` role, which is not a valid value for `@restrict.grant` so the rule will report a warning:

::: code-group
<<< ../examples/auth-valid-restrict-grant/incorrect/srv/cat-service.cds#snippet{cds:line-numbers} [srv/cat-service.cds]
:::
<PlaygroundBadge
  name="auth-valid-restrict-grant"
  kind="incorrect"
  :rules="{'@sap/cds/auth-valid-restrict-grant': ['warn', 'show']}"
  :files="['db/schema.cds', 'srv/cat-service.cds']"
/>

## Version
This rule was introduced in `@sap/eslint-plugin-cds 2.4.1`.