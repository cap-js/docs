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

## Concepts

Usually the emit of messages should be delayed until the main transaction succeeded, otherwise recipients also receive messages in case of a rollback.
To solve this problem, a transactional outbox can be used to defer the emit of messages until the success of the current transaction.

## In-Memory Outbox (Default) { #in-memory}

The in-memory outbox is used per default and the messages are emitted when the current transaction is successful. Until then, messages are kept in memory.


## Persistent Outbox { #persistent}

The persistent outbox requires a persistence layer to persist the messages before emitting them. Here, the to-be-emitted message is stored in a database table first. The same database transaction is used as for other operations, therefore transactional consistency is guaranteed.

Once the transaction succeeds, the messages are read from the database table and are emitted.

- If an emit was successful, the respective message is deleted from the database table.
- If an emit wasn't successful, there will be a retry after some (exponentially growing) waiting time. After a maximum number of attempts, the message is ignored for processing and remains in the database table. Even if the app crashes the messages can be redelivered after successful application startup.

To enable the persistence for the outbox, you need to add the service `outbox` of kind `persistent-outbox` to the `cds.requires` section in the _package.json_ or _cdsrc.json_. Please note that the _cdsrc.json_ file represents already the `cds` section and only the `requires` section should be added to the _cdsrc.json_ file:


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

For a multitenancy scenario, make sure that the required configuration is also done in MTX sidecar service. Make sure that the base model in all tenants is updated to activate the outbox.

::: info Option: Add outbox to your base model
Alternatively, you can add `using from '@sap/cds/srv/outbox';` to your base model. In this case, you need to update the tenant models after deployment but you don't need to update MTX Sidecar.
:::

CAP Java by default provides two persistent outbox services:

-  `DefaultOutboxOrdered` - is used by default by messaging services
-  `DefaultOutboxUnordered` - is used by default by the AuditLog service

The default configuration for both outboxes can be overridden using the `cds.outbox.services` section, for example in the _application.yaml_:

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
- `maxAttempts` (default `10`): The number of unsuccessful emits until the message is ignored. It still remains in the database table.
- `storeLastError` (default `true`): If this flag is enabled, the last error that occurred, when trying to emit the message
of an entry, is stored. The error is stored in the element `lastError` of the entity `cds.outbox.Messages`.

> Persistent outbox is supported starting with these versions: `@sap/cds: 5.7.0`,  `@sap/cds-compiler: 2.11.0` (`@sap/cds-dk: 4.7.0`)


### Configuring Custom Outboxes { #custom-outboxes}

Custom persistent outboxes can be configured using the `cds.outbox.services` section, for example in the _application.yaml_:

```yaml
cds:
  outbox:
    services:
      MyCustomOutbox:
        maxAttempts: 5
        storeLastError: false
      MyOtherCustomOutbox:
        maxAttempts: 10
        storeLastError: true
```

Afterwards you can access the outbox instances from the service catalog:

```java
OutboxService myCustomOutbox = cdsRuntime.getServiceCatalog().getService(OutboxService.class, "MyCustomOutbox");
OutboxService myOtherCustomOutbox = cdsRuntime.getServiceCatalog().getService(OutboxService.class, "MyOtherCustomOutbox");
```

Alternatively it's possible to inject them into a Spring component:

```java
@Component
public class MySpringComponent {
  private final OutboxService myCustomOutbox;

  public MySpringComponent(@Qualifier("MyCustomOutbox") OutboxService myCustomOutbox) {
    this.myCustomOutbox = myCustomOutbox;
  }
}
```

::: warning When removing a custom outbox ...
... it must be ensured that there are no unprocessed entries left.

Removing a custom outbox from the `cds.outbox.services` section doesn't remove the
entries from the `cds.outbox.Messages` table. The entries remain in the `cds.outbox.Messages` table and isn't
processed anymore.

:::

## Outboxing CAP Service Events

Outbox services support outboxing of arbitrary CAP services. Typical use cases are remote OData
service calls, but also supports calls to other CAP services to decouple them from the business logic flow.

The API `OutboxService.outboxed(Service)` is used to wrap services with outbox handling. Events triggered
on the wrapper are stored in the outbox first, and executed asynchronously. Relevant information from
the `RequestContext` is stored with the event data, however the user context is downgraded to a system user context.

The following example shows how to outbox a CAP Java service:

```java
OutboxService myCustomOutbox = ...;
CqnService remoteS4 = ...;
CqnService outboxedS4 = myCustomOutbox.outboxed(remoteS4);
```

The outboxed service can be cached; caching them is thread-safe.
Any service that implements the interface `com.sap.cds.services.Service`
or an inherited interface can be outboxed. Each call to the outboxed service is asynchronously
executed, if the API method internally calls the method `com.sap.cds.services.Service.emit(EventContext)`.

::: warning Asynchronous execution
All calls to `CqnService.run` methods return null since they're executed asynchronously.
:::

A service wrapped by an outbox can be unboxed by calling the API `OutboxService.unboxed(Service)`. Method calls to the unboxed
service are executed synchronously without storing the event in an outbox.

::: warning Java Proxy
A service wrapped by an outbox is a [Java Proxy](https://docs.oracle.com/javase/8/docs/technotes/guides/reflection/proxy.html). Such a proxy only implements the _interfaces_ of the object it is wrapping. This means an outboxed service proxy can't be casted to the class implementing the underlying service object.
:::

::: tip Custom outbox for scaling
The default outbox services can be used for outboxing arbitrary CAP services. If you detect a scaling issue,
you can define custom outboxes that can be used for outboxing.
:::

## Technical Outbox API

Outbox services provide the technical API `OutboxService.submit(String, OutboxMessage)` that can
be used to send custom messages via outbox.
When submitting a custom message, an `OutboxMessage` needs to be provided that can contain parameters for the
event. As the `OutboxMessage` instance is serialized and stored in the database, all data provided in that message
must be serializable and deserializable to/from JSON. The following example shows the submission of a custom message to an outbox:

```java
OutboxService outboxService;

OutboxMessage message = OutboxMessage.create();
Map<String, Object> parameters = new HashMap<>();
parameters.put("name", "John");
parameters.put("lastname", "Doe");
message.setParams(parameters);

outboxService.submit("myEvent", message);
```

A handler for the custom message must be registered on the outbox service instance to perform the processing of the
message as shown in the following example:

```java
OutboxService outboxService;

outboxService.on("myEvent", null, (ctx) -> {
  OutboxMessageEventContext context = ctx.as(OutboxMessageEventContext.class);
  OutboxMessage message = context.getMessage();
  Map<String, Object> params = message.getParams();
  String name = (String) param.get("name");
  String lastname = (String) param.get("lastname");

  // Perform task for myEvent

  ctx.setCompleted();
});
```

You must ensure that the handler is setting the context to completed before returning.
Also the handler shall only be registered once on the outbox service.

[Learn more about event handlers.](./event-handlers/){.learn-more}


## Troubleshooting

To manually delete entries in the `cds.outbox.Messages` table, you can either
expose it in a service or programmatically modify it using the `cds.outbox.Messages`
database entity.

::: tip Use paging logic
Avoid to read all entries of the `cds.outbox.Messages` table at once, as the size of an entry is unpredictable
and depends on the size of the payload. Prefer paging logic instead.
:::
