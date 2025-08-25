---
status: released
---

<script setup>
  import PlaygroundBadge from '../components/PlaygroundBadge.vue'
</script>

# case-sensitive-well-known-events

## Rule Details

Points out registrations to events that are likely well-known event names that have to be written in all-caps.

#### Version
This rule was introduced in `@sap/eslint-plugin-cds 4.0.2`.

## Examples

### ✅ &nbsp; Correct example

The following example shows the correctly capitalised event name `READ`:

::: code-group
<<< ../examples/case-sensitive-well-known-events/correct/srv/admin-service.js#snippet{js:line-numbers} [srv/admin-service.js]
:::
<PlaygroundBadge
  name="case-sensitive-well-known-events"
  kind="correct"
  :files="['srv/admin-service.js']"
/>

### ❌ &nbsp; Incorrect example

In this example we see a registration to an event `Read`, which is likely supposed to be `READ` and can therefore lead to unexpected behaviour, as event names in CAP are case sensitive:
::: code-group
<<< ../examples/case-sensitive-well-known-events/incorrect/srv/admin-service.js#snippet{js:line-numbers} [srv/admin-service.js]
:::
<PlaygroundBadge
  name="case-sensitive-well-known-events"
  kind="incorrect"
  :files="['srv/admin-service.js']"
/>
