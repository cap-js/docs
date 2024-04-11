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

# auth-no-empty-restrictions

## Rule Details

The [`@requires` annotation](../../../guides/security/authorization#requires--requires) is a convenience shortcut for `@restrict`. You can use it to control which rule a user needs to have in order to access a given resource. Leaving this field empty is dangerous as it leads to unrestricted access to that service which is a security risk.

## Examples

#### ✅ &nbsp; Correct example

In the following example, the `AdminService` is correctly setup with `@requires` given the `admin` role:

::: code-group
<<< ../examples/auth-no-empty-restrictions/correct/srv/admin-service.cds#snippet{cds:line-numbers} [srv/admin-service.cds]
:::
<PlaygroundBadge
  name="auth-no-empty-restrictions"
  kind="correct"
  :rules="{'@sap/cds/auth-no-empty-restrictions': ['error', 'show']}"
  :files="['srv/admin-service.cds', 'db/schema.cds']"
/>

#### ❌ &nbsp; Incorrect example

If we were to replace the `admin` role by an empty string or provide an empty role array as shown in the next example,
we now have unrestricted access to that service, which the rule makes us aware of:

::: code-group
<<< ../examples/auth-no-empty-restrictions/incorrect/srv/admin-service.cds#snippet{cds:line-numbers} [srv/admin-service.cds]
:::
<PlaygroundBadge
  name="auth-no-empty-restrictions"
  kind="incorrect"
  :rules="{'@sap/cds/auth-no-empty-restrictions': ['error', 'show']}"
  :files="['srv/admin-service.cds', 'db/schema.cds']"
/>

## Version
This rule was introduced in `@sap/eslint-plugin-cds 1.0.1`.
