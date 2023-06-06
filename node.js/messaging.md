---
synopsis: >
  Learn details about using messaging services and outbox for asynchronous communications.
redirect_from: node.js/outbox
layout: node-js
status: released
---
<!--- Migrated: @external/node.js/Messaging/0-index.md -> @external/node.js/messaging.md -->

# Messaging

{{$frontmatter?.synopsis}}

<!--- % include links-for-node.md %} -->
<!--- % include _chapters toc="2,3" %} -->


## cds.**MessagingService**  <i>  class </i>

  Class `cds.MessagingService` and subclasses thereof are technical services representing asynchronous messaging channels.
  They can be used directly/low-level, or behind the scenes on higher-level service-to-service eventing.

### class cds.**MessagingService**  <i>  extends cds.Service </i>

## Declaring Events

In your CDS model, you can model events using the `event` keyword inside services.
Once you created the `messaging` section in `cds.requires`, all modeled events are automatically enabled for messaging.

You can then use the services to emit events (for your own service) or receive events (for external services).

Example:

In your _package.json_:

```json
{
  "cds": {
    "requires": {
      "ExternalService": {
        "kind": "odata",
        "model": "srv/external/external.cds"
      },
      "messaging": {
        "kind": "enterprise-messaging"
      }
    }
  }
}
```

In _srv/external/external.cds_:

```cds
service ExternalService {
    event ExternalEvent {
        ID: UUID;
        name: String;
    }
}
```

In _srv/own.cds_:

```cds
service OwnService {
    event OwnEvent {
        ID: UUID;
        name: String;
    }
}
```

In _srv/own.js_:

```js
module.exports = async srv => {
  const externalService = await cds.connect.to('ExternalService')
  externalService.on('ExternalEvent', async msg => {
    await srv.emit('OwnEvent', msg.data)
  })
}
```

#### Custom Topics with Declared Events

You can specify topics to modeled events using the `@topic` annotation.
::: tip
If no annotation is provided, the topic will be set to the fully qualified event name.
:::

Example:

```cds
service OwnService {
    @topic: 'my.custom/topic'
    event OwnEvent { ID: UUID; name: String; }
}
```


## Emitting Events

To send a message to the message broker, you can use the `emit` method on a transaction for the connected service.

Example:

```js
const messaging = await cds.connect.to('messaging')

this.after(['CREATE', 'UPDATE', 'DELETE'], 'Reviews', async (_, req) => {
  const { subject } = req.data
  const { rating } = await cds.run(
    SELECT.one(['round(avg(rating),2) as rating'])
    .from(Reviews)
    .where({ subject }))

  // send to a topic
  await messaging.emit('cap/msg/system/review/reviewed',
   { subject, rating })

  // alternative if you want to send custom headers
  await messaging.emit({ event: 'cap/msg/system/review/reviewed',
    data: { subject, rating },
    headers: { 'X-Correlation-ID': req.headers['X-Correlation-ID'] }})
})
```
::: tip
The messages are sent once the transaction is successful.
Per default, an in-memory outbox is used.See [Messaging - Outbox](#transactional-outbox) for more information.
:::

## Receiving Events

To listen to messages from a message broker, you can use the `on` method on the connected service.
This also creates the necessary topic subscriptions.

Example:

```js
const messaging = await cds.connect.to('messaging')

// listen to a topic
messaging.on('cap/msg/system/review/reviewed', msg => {
  const { subject, rating } = msg.data
  return cds.run(UPDATE(Books, subject).with({ rating }))
})
```

Once all handlers are executed successfully, the message is acknowledged.
If one handler throws an error, the message broker will be informed that the message couldn't be consumed properly and might send the message again. To avoid endless cycles, consider catching all errors.

If you want to receive all messages without creating topic subscriptions, you can register on `'*'`. This is useful when consuming messages from a dead letter queue.

```js
messaging.on('*', async msg => { /*...*/ })
```


## CloudEvents Protocol

[CloudEvents](https://cloudevents.io/) is a commonly used specification for describing event data.

An example event looks like this:

```js
{
  "type": "sap.s4.beh.salesorder.v1.SalesOrder.Created.v1",
  "specversion": "1.0",
  "source": "/default/sap.s4.beh/ER9CLNT001",
  "id": "0894ef45-7741-1eea-b7be-ce30f48e9a1d",
  "time": "2020-08-14T06:21:52Z",
  "datacontenttype": "application/json",
  "data": {
    "SalesOrder":"3016329"
  }
}
```

To help you adhere to this standard, CAP prefills these header fields automatically.
To enable this, you need to set the option `format: 'cloudevents'` in your message broker.

Example:

```js
{
  cds: {
    requires: {
      messaging: {
        kind: 'enterprise-messaging-shared',
        format: 'cloudevents'
      }
    }
  }
}
```

You can always overwrite the default values.

### Topic Prefixes

If you want the topics to start with a certain string, you can set a publish and/or a subscribe prefix in your message broker.

Example:

```js
{
  cds: {
    requires: {
      messaging: {
        kind: 'enterprise-messaging-shared',
        publishPrefix: 'default/sap.cap/books/',
        subscribePrefix: 'default/sap.cap/reviews/'
      }
    }
  }
}
```

### Topic Manipulations

<span id="beforeeventmesh" />

#### [SAP Event Mesh](../guides/messaging/#sap-event-mesh)

If you specify your format to be `cloudevents`, the following default prefixes are set:

```js
{
  publishPrefix: '$namespace/ce/',
  subscribePrefix: '+/+/+/ce/'
}
```

In addition to that, slashes in the event name are replaced by dots and the `source` header field is derived based on `publishPrefix`.

Examples:

| publishPrefix            | derived source      |
|--------------------------|---------------------|
| `my/own/namespace/ce/`   | `/my/own/namespace` |
| `my/own.namespace/-/ce/` | `/my/own.namespace` |


## Message Brokers

To safely send and receive messages between applications, you need a message broker in-between where you can create queues that listen to topics. All relevant incoming messages are first stored in those queues before they're consumed. This way messages aren't lost when the consuming application isn't available.

In CDS, you can configure one of the available broker services in your [`requires` section](cds-connect#cds-env-requires).

According to our [grow as you go principle](../get-started/grow-as-you-go), it makes sense to first test your application logic without a message broker and enable it later. Therefore, we provide support for [local messaging](#local-messaging) (if everything is inside one Node.js process) as well as [file-based messaging](#file-based).

### Configuring Message Brokers

You must provide all necessary credentials by [binding](https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/296cd5945fd84d7d91061b2b2bcacb93.html) the message broker to your app.

For local environments, use [`cds bind`](../advanced/hybrid-testing#cds-bind-usage) in a [hybrid setup](../guides/messaging/event-mesh#run-tests-in-hybrid-setup).

::: tip
For local testing use [`kind`: `enterprise-messaging-shared`](#event-mesh-shared) to avoid the complexity of HTTP-based messaging.
:::

### SAP Event Mesh (Shared) { #event-mesh-shared}

`kind`: `enterprise-messaging-shared`

Use this if you want to communicate using [SAP Event Mesh](https://help.sap.com/docs/SAP_EM/bf82e6b26456494cbdd197057c09979f/df532e8735eb4322b00bfc7e42f84e8d.html) in a shared way.

If you register at least one handler, a queue will automatically be created if not yet existent. Keep in mind that unused queues aren't automatically deleted, this has to be done manually.

You have the following configuration options:

- `queue`: An object containing the `name` property as the name of your queue, additional properties are described in section [QueueP](https://help.sap.com/doc/75c9efd00fc14183abc4c613490c53f4/Cloud/en-US/rest-management-messaging.html#_queuep).
- `amqp`: AQMP client options as described in the [`@sap/xb-msg-amqp-v100` documentation](https://www.npmjs.com/package/@sap/xb-msg-amqp-v100?activeTab=readme)

If the queue name isn’t specified, it’s derived from `application_name` and the first four characters of `application_id` of your `VCAP_APPLICATION` environmental variable, as well as the `namespace` property of your SAP Event Mesh binding in `VCAP_SERVICES`: `{namespace}/{application_name}/{truncated_application_id}`.
This makes sure that every application has its own queue.

Example:

```json
{
    "requires": {
        "messaging": {
            "kind": "enterprise-messaging-shared",
            "queue": {
               "name": "my/enterprise/messaging/queue",
               "accessType": "EXCLUSIVE",
               "maxMessageSizeInBytes": 19000000
            },
            "amqp": {
              "incomingSessionWindow": 100
            }
        }
    }
}
```

::: warning _❗ Warning_{.warning-title}
When using `enterprise-messaging-shared` in a multitenant scenario, only the provider account will have an event bus. There is no tenant isolation.
:::

::: tip
You need to install the latest version of the NPM package `@sap/xb-msg-amqp-v100`.
:::

::: tip
For optimal performance, you should set the correct access type.
To make sure your server is not flooded with messages, you should set the incoming session window.
:::

### SAP Event Mesh

`kind`: `enterprise-messaging`

This is the same as `enterprise-messaging-shared` except that messages are transferred through HTTP. For incoming messages, a webhook is used.

Compared to `enterprise-messaging-shared` you have the additional configuration option:
- `webhook`: An object containing the `waitingPeriod` property as the time in milliseconds until a webhook is created after the application is listening to incoming HTTP requests (default: 5000). Additional properties are described in the `Subscription` object in [SAP Event Mesh - REST APIs Messaging](https://help.sap.com/doc/3dfdf81b17b744ea921ce7ad464d1bd7/Cloud/en-US/messagingrest-api-spec.html).

Example:

```json
{
    "requires": {
        "messaging": {
            "kind": "enterprise-messaging",
            "queue": {
               "name": "my/enterprise/messaging/queue",
               "accessType": "EXCLUSIVE",
               "maxMessageSizeInBytes": 19000000
            },
            "webhook": {
              "waitingPeriod": 7000
            }
        }
    }
}

```
<!-- ```js -->
<!-- { -->
<!--   waitingPeriod: 5000, -->
<!--   name: "{queueName}", -->
<!--   address: "queue:{queueName}", -->
<!--   qos: 1, -->
<!--   pushConfig: { -->
<!--     type: "webhook", -->
<!--     endpoint: "{VCAP_SERVICES.application_uris[0]}/messaging/enterprise-messaging?q={queueName}", -->
<!--     exemptHandshake: false, -->
<!--     securitySchema: { // if application is bound to an XSUAA instance -->
<!--       type: "oauth2", -->
<!--       grantType: "client_credentials", -->
<!--       clientId: "from Event Mesh binding", -->
<!--       clientSecret: "from Event Mesh binding", -->
<!--       tokenUrl: "from Event Mesh binding" -->
<!--     } -->
<!--   } -->
<!-- } -->
<!-- ``` -->
If your server is authenticated using [XSUAA](authentication#jwt), you need to grant the scope `$XSAPPNAME.emcallback` to SAP Event Mesh for it to be able to trigger the handshake and send messages.

In _xs-security.json_:

```js
{
  ...,
  "scopes": [
    ...,
    {
      "name": "$XSAPPNAME.emcallback",
      "description": "Event Mesh Callback Access",
      "grant-as-authority-to-apps": [
        "$XSSERVICENAME(<SERVICE_NAME_OF_YOUR_EVENT_MESH_INSTANCE>)"
      ]
    }
  ]
}
```

Make sure to add this to the service descriptor of your SAP Event Mesh instance:

```js
{
  ...,
  "authorities": [
    "$ACCEPT_GRANTED_AUTHORITIES"
  ]
}
```
::: warning
This will not work in the `dev` plan of SAP Event Mesh.
:::

::: warning
If you enable the [cors middleware](https://www.npmjs.com/package/cors), [handshake requests](https://help.sap.com/docs/SAP_EM/bf82e6b26456494cbdd197057c09979f/6a0e4c77e3014acb8738af039bd9df71.html?q=handshake) from SAP Event Mesh might be intercepted.
:::

<span id="aftereventmesh" />

<div id="queuing-sap" />

### Redis PubSub (beta)
::: warning
This is a beta feature. Beta features aren't part of the officially delivered scope that SAP guarantees for future releases.
:::

`kind`: `redis-messaging`

Use [Redis PubSub](https://redis.io/) as a message broker.

There are no queues:
- Messages are lost when consumers are not available.
- All instances receive the messages independently.
::: tip
You need to install the latest version of the NPM package `redis`.
:::


### File Based

`kind`: `file-based-messaging`

Don't use this in production, only if you want to test your application _locally_. It creates a file and uses it as a simple message broker.

>You can have at most one consuming app per emitted event.

You have the following configuration options:
* `file`: You can set the file path (default is _~/.cds-msg-box_).

Example:

```json
{
    "requires": {
        "messaging": {
            "kind": "file-based-messaging",
            "file": "../msg-box"
        }
    }
}
```

### Local Messaging

`kind`: `local-messaging`

You can use local messaging to communicate inside one Node.js process. It's especially useful in your automated tests.

### Composite-Messaging

`kind`: `composite-messaging`

If you have several messaging services and don't want to mention them explicitly in your code, you can create a `composite-messaging` service where you can define routes for incoming and outgoing messages. In those routes, you can use glob patterns to match topics (`**` for any number of any character, `*` for any number of any character except `/` and `.`, `?` for a single character).

Example:

```json
{
  "requires": {
    "messaging": {
      "kind": "composite-messaging",
      "routes": {
        "myEnterpriseMessagingReview": ["cap/msg/system/review/*"],
        "myEnterpriseMessagingBook": ["**/book/*"]
      }
    },
    "myEnterpriseMessagingReview": {
      "kind": "enterprise-messaging",
      "queue": {
        "name": "cap/msg/system/review"
      }
    },
    "myEnterpriseMessagingBook": {
      "kind": "enterprise-messaging",
      "queue": {
        "name": "cap/msg/system/book"
      }
    }
  }
}
```

```js
module.exports = async srv => {
  const messaging = await cds.connect.to('messaging')

  messaging.on('book/repository/book/modified', msg => {
    // comes from myEnterpriseMessagingBook
  })

  messaging.on('cap/msg/system/review/reviewed', msg => {
    // comes from myEnterpriseMessagingReview
  })
}
```



## Transactional Outbox

Usually the emit of messages should be delayed until the main transaction succeeded. Otherwise recipients will also receive messages in case of a rollback.
To solve this problem, an outbox is used internally to defer the emit of messages until the success of the current transaction.

### In-Memory Outbox (Default)

Per default, messages are emitted when the current transaction is successful. Until then, messages are kept in memory.
This is similar to the following code if done manually:
```js
cds.context.on('succeeded', () => this.emit(msg))
```
::: warning
The message is lost if its emit fails, there is no retry mechanism.
The app will crash if the error is identified as unrecoverable, for example in [SAP Event Mesh](../guides/messaging/event-mesh) if the used topic is forbidden.
:::


<span id="ininmemoryoutbox" />


### Persistent Outbox

Using the persistent outbox, the to-be-emitted message is stored in a database table first. The same database transaction is used
as for other operations, therefore transactional consistency is guaranteed.

To enable the persistent outbox globally for all deferrable services (that means [cds.MessagingService](messaging) and `cds.AuditLogService`), you need to add the service `outbox` of kind `persistent-outbox` to the `cds.requires` section.

```json
{
  "requires": {
    "outbox": {
      "kind": "persistent-outbox"
    }
  }
}
```

The optional parameters are:

- `maxAttempts` (default `20`): The number of unsuccessful emits until the message is ignored. It will still remain in the database table.
- `chunkSize` (default `100`): The number of messages which are read from the database table in one go.
- `storeLastError` (default `true`): Specifies if error information of the last failed emit should be stored in the outbox table.
- `parallel` (default `false`): Specifies if messages are sent in parallel (faster but the order isn't guaranteed).


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


After adding the `outbox` service to your _package.json_, your database model is automatically extended by the entity `cds.outbox.Messages`, as follows:

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
- Make sure to redeploy your model.
- If the app crashes, another emit for the respective tenant and service is necessary to restart.
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

#### Troubleshooting

##### Delete Entries in the Outbox Table

To manually delete entries in the table `cds.outbox.Messages`, you can either
expose it in a service or programmatically modify it using the `cds.outbox.Messages`
entity:

```js
const db = await cds.connect.to('db')
const { Messages } = db.entities('cds.outbox')
await DELETE.from(Messages)
```

##### Outbox Table Not Found

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

### Immediate Emit

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
