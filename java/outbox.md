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

## In-Memory Outbox (Default) { #in-memory}

The in-memory outbox is used per default and the messages are emitted when the current transaction is successful. Until then, messages are kept in memory.


## Persistent Outbox { #persistent}

The persistent outbox requires a persistence layer in order to persist the messages before emitting them. Here, the to-be-emitted message is stored in a database table first. The same database transaction is used as for other operations, therefore transactional consistency is guaranteed.

Once the transaction succeeds, the messages are read from the database table and emitted.

- If an emit was successful, the respective message is deleted from the database table.
- If an emit wasn't successful, there will be a retry after some (exponentially growing) waiting time. After a maximum number of attempts, the message is ignored for processing and remains in the database table. Even if the app crashes the messages can be redelivered after successful application startup.

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

CAP Java by default provides two persistent outbox services:

-  `DefaultOutboxOrdered` (technical id `OutboxService.PERSISTENT_ORDERED_NAME`) which sequentially processes the messages according to the stored order and
-  `DefaultOutboxUnordered` (technical id `OutboxService.PERSISTENT_UNORDERED_NAME`) which processes the messages in arbitrary order and thus also allows parallelization.

The default configuration for both outboxes can be overridden using the `outbox.services` section in the _application.yaml_:

```yaml
cds:
  outbox:
    services:
      DefaultOutboxOrdered:
        maxAttempts: 10
        storeLastError: true
      DefaultOutboxUnordered:
        maxAttempts: 10
        storeLastError: true
```

You have the following configuration options:
- `maxAttempts` (default `10`): The number of unsuccessful emits until the message is ignored. It will still remain in the database table.
- `storeLastError` (default `true`): If this flag is enabled, the last error that occurred, when trying to emit the message
of an entry, is stored. The error is stored in the element `lastError` of the entity `cds.outbox.Messages`.

::: warning _❗ Warning_
The configuration section `outbox.persistent` in the _application.yaml_ is deprecated. If it is still available in the
_application.yaml_ it will be taken as a default, if none of the aforementioned outboxes configured explicitly:

```yaml
cds:
  outbox:
    persistent:
      enabled: true
      maxAttempts: 10
      storeLastError: true
```

If `enabled` (default `true`) is set to `false`, no persistent outbox will be created.
:::

::: tip
Persistent outbox is supported starting with these version: `@sap/cds: 5.7.0`,  `@sap/cds-compiler: 2.11.0` (`@sap/cds-dk: 4.7.0`)
:::

## Generic Outbox

::: tip
The generic outbox is supported starting with version `com.sap.cds:cds-services-bom:2.7.0`.
:::

### Configuring Custom Outboxes

Custom outboxes can be configured using the `outbox.services` section in the _application.yaml_:

```yaml
cds:
  outbox:
    services:
      MyCustomOutbox1:
        maxAttempts: 5
        storeLastError: false
      MyOtherCustomOutbox:
        maxAttempts: 10
        storeLastError: true
```

Afterwards it's possible to get the outbox instances in the source code from the service catalog:

```java
OutboxService myCustomOutbox1 = cdsRuntime.getServiceCatalog().getService(OutboxService.class, "MyCustomOutbox1");
OutboxService myOtherCustomOutbox = cdsRuntime.getServiceCatalog().getService(OutboxService.class, "MyOtherCustomOutbox");
```

Alternatively it's possible to inject them into a Spring component:

```java
@Component
public class MySpringComponent {
  private final OutboxService myCustomOutbox1;
  private final OutboxService myOtherCustomOutbox;

  public MySpringComponent(@Qualifier("MyCustomOutbox1") OutboxService myCustomOutbox1;
    @Qualifier("MyOtherCustomOutbox") OutboxService myOtherCustomOutbox) {

    this.myCustomOutbox1 = myCustomOutbox1;
    this.myOtherCustomOutbox = myOtherCustomOutbox;
  }
}
```

### Outboxing CAP Service Events

Outbox services support outboxing of arbitrary CAP service events. Typical use cases are remote OData
service calls, but also calls to other CAP services are supported in order to decouple from business logic flow.

The API `OutboxService.outboxed(Service)` is used to wrap services with outbox handling. Events triggered
on the wrapper are stored in the outbox first, and executed asynchronously. Relevant information from
the `RequestContext` is stored with the event data, however the user context is downgraded to a system user context.

The following example shows how to outbox a CAP Java service:

```java
OutboxService myCustomOutbox1 = ...;
Service service = ...;
Service outboxedService = myCustomOutbox1.outboxed(service);
```

The outboxed service should be cached, if it is frequently used as outboxing a service is an
expensive operation. Any service that implements the interface `com.sap.cds.services.Service`
or an inherited interface can be outboxed. Each call to the outboxed service is asynchronously
executed, if the API method internally calls the method `com.sap.cds.services.Service.emit(EventContext)`.

::: warning _❗ Warning_
All calls to `run` methods of a service that implements the interface `com.sap.cds.services.cds.CqnService`
return null since they are executed asynchronously. The method `com.sap.cds.services.cds.CqnService.run(CqnSelect, ...)`
should not be called since the result will be lost because of the asynchronous behaviour of outboxed services.
:::

A service wrapped by an outbox can be unboxed by calling the API `OutboxService.unboxed(Service)`; method calls to the unboxed
service are executed synchronously without storing the event in an outbox.

::: tip
Avoid to use one of the default outbox services when outboxing arbitrary CAP services. Configure
and use custom outboxes instead to avoid delays in outbox entry processing for the case that errors
occur during processing.
:::

### Technical Outbox API

TODO


## Troubleshooting

To manually delete entries in the `cds.outbox.Messages` table, you can either
expose it in a service or programmatically modify it using the `cds.outbox.Messages`
database entity.

::: tip
Avoid to read all entries of the `cds.outbox.Messages` table at once as the size of an entry is unpredictable
as it depends on the size of the payload, use paging logic instead.
:::
