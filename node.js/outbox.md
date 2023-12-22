---
synopsis: >
  Learn details about the outbox feature.
redirect_from: node.js/outbox
# layout: node-js
status: released
---
<!--- Migrated: @external/node.js/Messaging/0-index.md -> @external/node.js/messaging.md -->

# Transactional Outbox

Often, remote operations should be delayed until the main transaction succeeded. Otherwise they're also triggered in case of a rollback.
To enable this, an outbox can be used to defer remote operations until the success of the current transaction.

Every CAP service can be _outboxed_, that means event dispatching becomes _asynchronous_. 

Programmatically, you can get the outboxed service with

```js
const srv = await cds.connect.to('yourService')
const outboxed = cds.outboxed(srv)

await outboxed.emit('someEvent', { some: 'message' }) // asynchronous
await outboxed.send('someEvent', { some: 'message' }) // asynchronous
```

::: tip
You still need to `await` these operations, because messages might be stored in a database first, inside your main transaction.
:::

The `cds.outboxed` function can also be called with optional configuration options.

```js
const outboxed = cds.outboxed(srv, { kind: 'persistent-outbox' })
```

::: warning
The persistent outbox can only be used if it's enabled globally with `cds.requires.outbox = true` because it requires a dedicated database table.
:::

::: warning
Once you outboxed a service, you cannot override its outbox configuration options again.
:::



You can also configure services to be outboxed by default:

```json
{
  "requires": {
    "yourService": {
      "kind": "odata",
      "outbox": {
        "kind": "persistent-outbox"
      }
    }
  }
}
```

::: tip
Some services are outboxed by default, these include [cds.MessagingService](messaging) and `cds.AuditLogService`.
:::

For transactional safety, you're encouraged to enable the [persistent outbox](#persistent-outbox) with:

```json
{
  "requires": {
    "outbox": true
  }
}
```

<span id="ininmemoryoutbox" />


## Persistent Outbox (Default) {#persistent-outbox}

You can enable it globally for all outboxed services with:

```json
{
  "requires": {
    "outbox": true
  }
}
```

Using the persistent outbox, the to-be-emitted message is stored in a database table first. The same database transaction is used
as for other operations, therefore transactional consistency is guaranteed.

You can use the following configuration options, the defaults are:

```json
{
  "requires": {
    "outbox": {
      "kind": "persistent-outbox",
      "maxAttempts": 20,
      "chunkSize": 100,
      "storeLastError": true,
      "parallel": true
    }
  }
}
```

The optional parameters are:

- `maxAttempts` (default `20`): The number of unsuccessful emits until the message is ignored. It will still remain in the database table.
- `chunkSize` (default `100`): The number of messages which are read from the database table in one go.
- `storeLastError` (default `true`): Specifies if error information of the last failed emit should be stored in the outbox table.
- `parallel` (default `true`): Specifies if messages are sent in parallel (faster but the order isn't guaranteed).


Once the transaction succeeds, the messages are read from the database table and emitted. If an emit was successful, the respective message
is deleted from the database table. If not, there will be retries after (exponentially growing) waiting times.
After a maximum number of attempts, the message is ignored for processing and remains in the database table which
therefore also acts as a dead letter queue.
There is only one active message processor per service, tenant and app instance, hence there won't be
duplicate emits except in the unlikely case of an app crash right after the emit and before the deletion of the
message entry.
::: tip
Some errors during the emit are identified as unrecoverable, for example in [SAP Event Mesh](../guides/messaging/event-mesh) if the used topic is forbidden.
The respective message is then updated and the `attempts` field is set to `maxAttempts` to prevent further processing.
[Programming errors](./best-practices#error-types) crash the server instance and must be fixed.
:::


Your database model is automatically extended by the entity `cds.outbox.Messages`, as follows:

```cds
using cuid from '@sap/cds/common';

namespace cds.outbox;

entity Messages : cuid {
  timestamp: Timestamp;
  target: String;
  msg: LargeString;
  attempts: Integer default 0;
  partition: Integer default 0;
  lastError: LargeString;
  lastAttemptTimestamp: Timestamp @cds.on.update : $now;
}
```
::: tip
In your CDS model, you can refer to the entity `cds.outbox.Messages` using the path `@sap/cds/srv/outbox`,
for example to expose it in a service.
:::

::: warning
- If the app crashes, another emit for the respective tenant and service is necessary to restart the message processing.
- The user id is stored to recreate the correct context.
:::

To overwrite the outbox configuration for a particular service, you can specify the `outbox` option.

Example:

```json
{
  "requires": {
    "messaging": {
      "kind": "enterprise-messaging",
      "outbox": {
        "maxAttempts": 10,
        "chunkSize": 10
      }
    }
  }
}
```

## In-Memory Outbox

You can enable it globally for all outboxed services with:

```json
{
  "requires": {
    "outbox": {
      "kind": "in-memory-outbox"
    }
  }
}
```
Messages are emitted when the current transaction is successful. Until then, messages are only kept in memory.
This is similar to the following code if done manually:
```js
cds.context.on('succeeded', () => this.emit(msg))
```
::: warning
The message is lost if its emit fails, there is no retry mechanism.
:::

## Immediate Emit

To disable deferred emitting for a particular service, you can set the `outbox` option of your service to `false`:

```json
{
  "requires": {
    "messaging": {
      "kind": "enterprise-messaging",
      "outbox": false
    }
  }
}
```

## Troubleshooting

### Delete Entries in the Outbox Table

To manually delete entries in the table `cds.outbox.Messages`, you can either
expose it in a service or programmatically modify it using the `cds.outbox.Messages`
entity:

```js
const db = await cds.connect.to('db')
const { Messages } = db.entities('cds.outbox')
await DELETE.from(Messages)
```

### Outbox Table Not Found

If the outbox table is not found on the database, this can be caused by insufficient configuration data in _package.json_.

In case you have overwritten `requires.db.model` there, make sure to add the outbox model path `@sap/cds/srv/outbox`:

```jsonc
"requires": {
  "db": { ...
    "model": [..., "@sap/cds/srv/outbox"]
  }
}
```

The following is only relevant if you're using @sap/cds version < 6.7.0 and you've configured `options.model` in custom build tasks.
Add the model path accordingly:

```jsonc
"build": {
  "tasks": [{ ...
    "options": { "model": [..., "@sap/cds/srv/outbox"] }
  }]
}
```

Note that model configuration isn't required for CAP projects using the [standard project layout](../get-started/jumpstart#project-structure) that contain the folders `db`, `srv`, and `app`. In this case, you can delete the entire `model` configuration.
