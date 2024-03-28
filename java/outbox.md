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
- `ordered` (default `true`): If this flag is enabled, the outbox instance processes the entries in the order they have been submitted to it. Otherwise the outbox may process entries randomly and in parallel, by leveraging outbox processors running in multiple application instances.

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

Outbox services support outboxing of arbitrary CAP services. A typical use case is to outbox remote OData
service calls, but also calls to other CAP services can be decoupled from the business logic flow.

The API `OutboxService.outboxed(Service)` is used to wrap services with outbox handling. Events triggered
on the returned wrapper are stored in the outbox first, and executed asynchronously. Relevant information from
the `RequestContext` is stored with the event data, however the user context is downgraded to a system user context.

The following example shows you how to outbox a service:

```java
OutboxService myCustomOutbox = ...;
CqnService remoteS4 = ...;
CqnService outboxedS4 = myCustomOutbox.outboxed(remoteS4);
```

If a method on the outboxed service has a return value, it will always return `null` since it is executed asynchronously. A common example for this are the `CqnService.run(...)` methods. 
To improve this the API `OutboxService.outboxed(Service, Class)` can be used, which wraps a service with an asynchronous suited API while outboxing it.
This can be used together with the interface `AsyncCqnService` to outbox remote OData services:

```java
OutboxService myCustomOutbox = ...;
CqnService remoteS4 = ...;
AsyncCqnService outboxedS4 = myCustomOutbox.outboxed(remoteS4, AsyncCqnService.class);
```

The method `AsyncCqnService.of()` can be used alternatively to achieve the same for CqnServices:

```java
OutboxService myCustomOutbox = ...;
CqnService remoteS4 = ...;
AsyncCqnService outboxedS4 = AsyncCqnService.of(remoteS4, myCustomOutbox);
```

::: tip Custom asynchronous suited API
When defining your own custom asynchronous suited API, the interface must provide the same method signatures as the interface of the outboxed service, except for the return types which should be `void`.
:::

The outboxed service is thread-safe and can be cached.
Any service that implements the `Service` interface can be outboxed.
Each call to the outboxed service is asynchronously executed, if the API method internally calls the method `Service.emit(EventContext)`.

A service wrapped by an outbox can be unboxed by calling the API `OutboxService.unboxed(Service)`. Method calls to the unboxed
service are executed synchronously without storing the event in an outbox.

::: warning Java Proxy
A service wrapped by an outbox is a [Java Proxy](https://docs.oracle.com/javase/8/docs/technotes/guides/reflection/proxy.html). Such a proxy only implements the _interfaces_ of the object it is wrapping. This means an outboxed service proxy can't be casted to the class implementing the underlying service object.
:::

::: tip Custom outbox for scaling
The default outbox services can be used for outboxing arbitrary CAP services. If you detect a scaling issue,
you can define custom outboxes that can be used for outboxing.
:::

## Technical Outbox API { #technical-outbox-api }

Outbox services provide the technical API `OutboxService.submit(String, OutboxMessage)` that can be used to outbox custom messages for an arbitrary event or processing logic.
When submitting a custom message, an `OutboxMessage` that can optionally contain parameters for the event needs to be provided.
As the `OutboxMessage` instance is serialized and stored in the database, all data provided in that message
must be serializable and deserializable to/from JSON. The following example shows the submission of a custom message to an outbox:

```java
OutboxService outboxService = runtime.getServiceCatalog(OutboxService.class, "<OutboxServiceName>");

OutboxMessage message = OutboxMessage.create();
message.setParams(Map.of("name", "John", "lastname", "Doe"));

outboxService.submit("myEvent", message);
```

A handler for the custom message must be registered on the outbox service. This handler performs the processing logic when the message is published by the outbox:

```java
@On(service = "<OutboxServiceName>", event = "myEvent")
void processMyEvent(OutboxMessageEventContext context) {
  OutboxMessage message = context.getMessage();
  Map<String, Object> params = message.getParams();
  String name = (String) param.get("name");
  String lastname = (String) param.get("lastname");

  // Perform processing logic for myEvent

  ctx.setCompleted();
}
```

You must ensure that the handler is completing the context, after executing the processing logic.

[Learn more about event handlers.](./event-handlers/){.learn-more}

## Handling Outbox Errors { #handling-outbox-errors }

The outbox by default retries publishing a message, if an error occurs during processing, until the message has reached the maximum number of attempts.
This behavior makes applications resilient against unavailability of external systems, which is a typical use case for outbox message processing.

However, there might also be situations in which it is not reasonable to retry publishing a message.
For example, when the processed message causes a semantic error - typically due to a 400 Bad request - on the external system.
Outbox messages causing such errors should be removed from the outbox message table before reaching the maximum number of retry attempts and instead application-specific
counter-measures should be taken to correct the semantic error or ignore the message altogether.

A simple try-catch block around the message processing can be used to handle errors:
- If an error should cause a retry, the original exception should be (re)thrown (default behavior).
- If an error should not cause a retry, the exception should be suppressed and additional steps can be performed.

```java
@On(service = "<OutboxServiceName>", event = "myEvent")
void processMyEvent(OutboxMessageEventContext context) {
  try {
    // Perform processing logic for myEvent
  } catch (Exception e) {
    if (isUnrecoverableSemanticError(e)) {
      // Perform application-specific counter-measures
      context.setCompleted(); // indicate message deletion to outbox
    } else {
      throw e; // indicate error to outbox
    }
  }
}
```

In some situations, the original outbox processing logic is not implemented by you but the processing needs to be extended with additional error handling.
In that case, wrap the `EventContext.proceed()` method, which executes the underlying processing logic:

```java
@On(service = OutboxService.PERSISTENT_ORDERED_NAME, event = AuditLogService.DEFAULT_NAME)
void handleAuditLogProcessingErrors(OutboxMessageEventContext context) {
  try {
    context.proceed(); // wrap default logic
  } catch (Exception e) {
    if (isUnrecoverableSemanticError(e)) {
      // Perform application-specific counter-measures
      context.setCompleted(); // indicate message deletion to outbox
    } else {
      throw e; // indicate error to outbox
    }
  }
}
```

[Learn more about `EventContext.proceed()`.](./event-handlers/#proceed-on){.learn-more}

## Troubleshooting

To manually delete entries in the `cds.outbox.Messages` table, you can either
expose it in a service or programmatically modify it using the `cds.outbox.Messages`
database entity.

::: tip Use paging logic
Avoid to read all entries of the `cds.outbox.Messages` table at once, as the size of an entry is unpredictable
and depends on the size of the payload. Prefer paging logic instead.
:::
