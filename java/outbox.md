---
synopsis: >
  Find here information about the Outbox service in CAP Java.
status: released
---

# Transactional Outbox
<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>

{{ $frontmatter.synopsis }}


<!-- #### Content -->
<!--- % include _chapters toc="2,3" %} -->

<!--- Migrated: @external/java/355-Outbox/01-service.md -> @external/java/outbox/service.md -->
## Concepts

Usually the emit of messages should be delayed until the main transaction succeeded, otherwise recipients will also receive messages in case of a rollback.
To solve this problem, a transactional outbox can be used to defer the emit of messages until the success of the current transaction.

The transactional outbox is a part of the CAP technical services for [Messaging](./messaging-foundation) and [AuditLog](./auditlog).


## In-Memory Outbox (Default) { #in-memory}

The in-memory outbox is used per default and the messages are emitted when the current transaction is successful. Until then, messages are kept in memory.


## Persistent Outbox { #persistent}

The persistent outbox requires a persistence layer in order to persist the messages before emitting them. Here, the to-be-emitted message is stored in a database table first. The same database transaction is used as for other operations, therefore transactional consistency is guaranteed.

Once the transaction succeeds, the messages are read from the database table and emitted.

- If an emit was successful, the respective message is deleted from the database table.
- If an emit wasn't successful, there will be a retry after some (exponentially growing) waiting time. After a maximum number of attempts, the message is ignored for processing and remains in the database table. Even if the app crashes the messages can be redelivered after successful application startup.

To configure the persistent outbox you can use the `outbox.persistent` section in the _application.yaml_:

```yaml
cds:
  outbox:
    persistent:
      enabled: true
      maxAttempts: 10
      storeLastError: true
```

You have the following configuration options:
- `enabled` (default `true`): Persistent outbox enablement.
- `maxAttempts` (default `10`): The number of unsuccessful emits until the message is ignored. It will still remain in the database table.
- `storeLastError` (default `true`): If this flag is enabled, the last error that occurred, when trying to emit the message
of an entry,  is stored. The error is stored in the element `lastError` of the entity `cds.outbox.Messages`.

::: warning _❗ Warning_
In order to enable the persistence for the outbox, you need to add the service `outbox` of kind `persistent-outbox` to the `cds.requires` section in the _package.json_ or _cdsrc.json_. Please note that the _cdsrc.json_ file represents already the `cds` section and only the `requires` section should be added to the _cdsrc.json_ file:
:::

```json
    "cds": {
        "requires": {
            "outbox": {
                "kind": "persistent-outbox"
            }
        }
    }
```

::: warning _❗ Warning_
Be aware that you need to migrate the database schemas of all tenants after you've enhanced your model with an outbox version from `@sap/cds`  version 6.0.0 or later.
:::

In case of MT scenario make sure that the required configuration is also done in MTX sidecar service. In any case, the base model in all tenants needs to be updated to activate the outbox.

::: tip
Alternatively, you can add `using from '@sap/cds/srv/outbox';` to your base model. You need to update the tenant models after deployment. You don't need to update MTX Sidecar in this case.
:::

::: tip
Persistent outbox is supported starting with these version: `@sap/cds: 5.7.0`,  `@sap/cds-compiler: 2.11.0` (`@sap/cds-dk: 4.7.0`)
:::


#### Troubleshooting

To manually delete entries in the `cds.outbox.Messages` table, you can either
expose it in a service or programmatically modify it using the `cds.outbox.Messages`
database entity.
