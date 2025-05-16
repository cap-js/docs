---
synopsis: >
  Learn details about the task-queue feature.
# layout: node-js
status: released
---

# Queueing with `cds.queued`

[[toc]]


## Overview

The _task queue_ feature allows you to defer event processing.

A common use case is the outbox pattern, where remote operations are deferred until the main transaction has been successfully committed.
This prevents accidental execution of remote calls in case the transaction is rolled back.

Every CAP service can be _queued_, meaning that event dispatching becomes _asynchronous_.


## Queueing a Service


### cds.queued(srv) {.method}

Programmatically, you can get the queued service as follows:

```js
const srv = await cds.connect.to('yourService')
const queued = cds.queued(srv)

await queued.emit('someEvent', { some: 'message' }) // asynchronous
await queued.send('someEvent', { some: 'message' }) // asynchronous
```

::: tip
You still need to `await` these operations becase they are asynchronous. In case of a persistent queue, which is the default, messages are stored in the database, within the current transaction.
:::

The `cds.queued` function can also be called with optional configuration options.

```js
const queued = cds.queued(srv, { maxAttempts: 5 })
```

> The persistent queue can only be used if it's not disabled globally by `cds.requires.queue = false` because it requires a dedicated database table.

::: warning One-time configuration
Once you queued a service, you cannot override its configuration options again.
:::


### cds.unqueued(srv) {.method}

Use this on a queued service to get back the original service:

```js
const unqueued = cds.unqueued(srv)
```

This is useful if your service is outboxed (i.e., queued) per configuration.


### Per Configuration

You can also configure services to be outboxed by default:

```json
{
  "requires": {
    "yourService": {
      "kind": "odata",
      "outboxed": true
    }
  }
}
```

::: tip Outboxed by default
Some services are outboxed by default; these include [`cds.MessagingService`](messaging) and `cds.AuditLogService`.
:::

For transactional safety, you're encouraged to use the [persistent queue](#persistent-queue) which is enabled by default.


## Persistent Queue (Default) {#persistent-queue}

The persistent queue is enabled by default.

You can disable it globally with:

```json
{
  "requires": {
    "queue": false
  }
}
```

Using the persistent queue, the to-be-emitted message is stored in a database table within the current transaction, therefore transactional consistency is guaranteed.

You can use the following configuration options:

```json
{
  "requires": {
    "queue": {
      "kind": "persistent-queue",
      "maxAttempts": 20,
      "chunkSize": 10,
      "storeLastError": true,
      "parallel": true,
      "timeout": "1h",
      "legacyLocking": true
    }
  }
}
```

The optional parameters are:

- `maxAttempts` (default `20`): The number of unsuccessful emits until the message is ignored. It will still remain in the database table.
- `chunkSize` (default `10`): The number of messages which are read from the database table in one go. Only applies for `parallel != false`.
- `storeLastError` (default `true`): Specifies if error information of the last failed emit should be stored in the tasks table.
- `parallel` (default `true`): Specifies if messages are sent in parallel (faster but the order isn't guaranteed).
- `timeout` (default `"1h"`): The time after which a message with `status = "processing"` can be processed again. Only for `legacyLocking = false`.
- `legacyLocking` (default `true`): If set to `false`, database locks are only used to set the status of the message to `processing` to prevent long-kept database locks. This is recommended but incompatible for parallel usage with `@sap/cds^8` instances.


Once the transaction succeeds, the messages are read from the database table and emitted.
If an emit was successful, the respective message is deleted from the database table.
If not, the system retries the message after exponentially increasing delays.
After a maximum number of attempts, the message is ignored for processing and remains in the database table which
therefore also acts as a dead letter queue.
See [Managing the Dead Letter Queue](#managing-the-dead-letter-queue), to learn about how to handle such messages.

There is only one active message processor per service, tenant, app instance and message.
This ensures no duplicate emits, except in the unlikely case of an app crash right after the emit and before the message is deleted.

::: tip
Some errors during the emit are identified as unrecoverable, for example in [SAP Event Mesh](../guides/messaging/event-mesh) if the used topic is forbidden.
The respective message is then updated and the `attempts` field is set to `maxAttempts` to prevent further processing.
[Programming errors](./best-practices#error-types) crash the server instance and must be fixed.
To mark your own errors as unrecoverable, you can set `unrecoverable = true` on the error object.
:::


Your database model is automatically extended by the entity `cds.outbox.Messages`:

```cds
namespace cds.outbox;

entity Messages {
  key ID                   : UUID;
      timestamp            : Timestamp;
      target               : String;
      msg                  : LargeString;
      attempts             : Integer default 0;
      lastError            : LargeString;
      lastAttemptTimestamp : Timestamp @cds.on.update: $now;
}
```

In your CDS model, you can refer to the entity `cds.outbox.Messages` using the path `@sap/cds/srv/outbox`,
for example to expose it in a service.


#### Known Limitations

- If the app crashes, another emit for the respective tenant and service is necessary to restart the message processing.
- The service that handles the queued event must not use user roles and attributes as they are not stored. However, the user ID is stored to recreate the correct context.


### Managing the Dead Letter Queue

You can manage the dead letter queue by implementing a service that exposes a read-only projection on entity `cds.outbox.Messages` as well as bound actions to either revive or delete the respective message.

::: tip
See [Outbox Dead Letter Queue](../java/outbox#outbox-dead-letter-queue) in the CAP Java documentation for additional considerations while we work on a general Outbox guide.
:::

#### 1. Define the Service

::: code-group
```cds [srv/outbox-dead-letter-queue-service.cds]
using from '@sap/cds/srv/outbox';

@requires: 'internal-user'
service OutboxDeadLetterQueueService {

  @readonly
  entity DeadOutboxMessages as projection on cds.outbox.Messages
    actions {
      action revive();
      action delete();
    };

}
```
:::

#### 2. Filter for Dead Entries

As `maxAttempts` is configurable, its value can not be added as a static filter to projection `DeadOutboxMessages`, but must be considered programmatically.

::: code-group
<<< ./assets/dead-letter-queue-1.js#snippet{5-8} [srv/outbox-dead-letter-queue-service.js]
:::

#### 3. Implement Bound Actions

Finally, entries in the dead letter queue can either be _revived_ by resetting the number of attempts (that is, `SET attempts = 0`) or _deleted_.

::: code-group
<<< ./assets/dead-letter-queue-2.js#snippet{10-12,14-16} [srv/outbox-dead-letter-queue-service.js]
:::

#### Additional APIs <Beta />

To manually trigger the message processing, for example if your server is restarted, you can use the `flush` method.

```js
const srv = await cds.connect.to('yourService')
cds.queued(srv).flush()       // for current tenant
cds.queued(srv).flush(tenant) // for provided tenant
```

Once a message has been successfully processed, it will trigger the `<event>/#succeeded` handlers.

```js
srv.after('someEvent/#succeeded', (data, req) => {
  // `data` is the result of the event processor
  console.log('Message successfully processed:', data)
})
```

Similarly, you can use the `<event>/#failed` event to handle failed messages (once the maximum retry count is reached).

```js
srv.after('someEvent/#failed', (data, req) => {
  // `data` is the error from the event processor
  console.log('Message could not be processed:', data)
})
```

## In-Memory Queue

You can enable it globally for all queued services with:

```json
{
  "requires": {
    "queue": {
      "kind": "in-memory-queue"
    }
  }
}
```
Messages are emitted only when the current transaction is successful. Until then, messages are only kept in memory.
This is similar to the following code if done manually:
```js
cds.context.on('succeeded', () => this.emit(msg))
```
::: warning No retry mechanism
The message is lost if the emit fails. There is no retry mechanism.
:::


## Immediate Emit

To disable deferred emitting for a particular service, you can set the `outboxed` option of your service to `false`:

```json
{
  "requires": {
    "messaging": {
      "kind": "enterprise-messaging",
      "outboxed": false
    }
  }
}
```

## Troubleshooting

### Delete Entries in the Tasks Table

To manually delete entries in the table `cds.outbox.Messages`, you can either
expose it in a service, see [Managing the Dead Letter Queue](#managing-the-dead-letter-queue), or programmatically modify it using the `cds.outbox.Messages`
entity:

```js
const db = await cds.connect.to('db')
await DELETE.from('cds.outbox.Messages')
```

### Tasks Table Not Found

If the tasks table is not found on the database, this can be caused by insufficient configuration data in _package.json_.

In case you have overwritten `requires.db.model` there, make sure to add the queue model path `@sap/cds/srv/outbox`:

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

Note that model configuration isn't required for CAP projects using the [standard project layout](../get-started/#project-structure) that contain the folders `db`, `srv`, and `app`. In this case, you can delete the entire `model` configuration.
