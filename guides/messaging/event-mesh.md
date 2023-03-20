---
layout: cookbook
shorty: SAP Event Mesh
breadcrumbs:
  - Cookbook
  - Messaging
  - SAP Event Mesh
status: released
---

# Using SAP Event Mesh in Cloud Foundry

[SAP Event Mesh](https://help.sap.com/docs/SAP_EM) is the default offering for messaging in SAP Business Technology Platform (SAP BTP). CAP provides out-of-the-box support for SAP Event Mesh, and automatically handles many things behind the scenes, so that application coding stays agnostic and focused on conceptual messaging.

::: warning
The following guide is based on a productive (paid) account on SAP BTP. It's not supported to use the trial offering of SAP Event Mesh.
:::



## Prerequisite: Create an Instance of SAP Event Mesh

- [Follow this tutorial](https://developers.sap.com/group.cp-enterprisemessaging-get-started.html) to create an instance of SAP Event Mesh with plan `default`.
- Alternatively follow [one of the guides in SAP Help Portal](https://help.sap.com/docs/SAP_EM/bf82e6b26456494cbdd197057c09979f/3ef34ffcbbe94d3e8fff0f9ea2d5911d.html).

::: tip
**Important:** You don't need to manually create queues or queue subscriptions as CAP takes care for that automatically based on declared events and subscriptions.
:::


## Use `enterprise-messaging`

Add the following to your _package.json_ to use SAP Event Mesh:

```jsonc
"cds": {
  "requires": {
    "messaging": {
      "[production]": { "kind": "enterprise-messaging" },
    }
  }
}
```

[Learn more about `cds.env` profiles](../../node.js/cds-env#profiles){:.learn-more}

<div class="tip" markdown="1">

**Behind the Scenes**, the `enterprise-messaging` implementation handles these things automatically and transparently:

  - Creation of queues & subscriptions for event receivers
  - Handling all broker-specific handshaking and acknowledgments
  - Constructing topic names as expected by the broker
  - Wire protocol envelopes, that is, CloudEvents

</div>


### Optional: Add `namespace` Prefixing Rules

SAP Event Mesh documentation recommends to prefix all event names with the service instance's configured `namespace`, both, when emitting as well as when subscribing to events. If you followed these rules, add corresponding rules to your configuration in _package.json_ to have CAP's messaging service implementations enforcing these rules automatically:

```json
"cds": {
  "requires": {
    "messaging": {
      "publishPrefix": "$namespace/",
      "subscribePrefix": "$namespace/"
    }
  }
}
```

The variable `$namespace` is resolved from your SAP Event Mesh service instance's configured `namespace` property.


## Run Tests in `hybrid` Setup

Before [deploying to the cloud](#deploy-to-the-cloud-with-mta), you may want to run some ad-hoc tests with a hybrid setup, that is, keep running the CAP services locally, but using the SAP Event Mesh instance from the cloud. Do that as follows:

1. Configure CAP to use the `enterprise-messaging-shared` implementation in the `reviews` and `bookstore` sample:

    ```jsonc
    "cds": {
      "requires": {
        "messaging": {
          "[hybrid]": { "kind": "enterprise-messaging-shared" }
        }
      }
    }
    ```

    > The `enterprise-messaging-shared` variant is for single-tenant usage and uses AMQP by default. Thus, it requires much less setup for local tests compared to the production variant, which uses HTTP-based protocols by default.

2. Add `@sap/xb-msg-amqp-v100` as dependency to `reviews` and `bookstore`:

    ```sh
    npm add @sap/xb-msg-amqp-v100
    ```

    [Learn more about SAP Event Mesh (Shared).](../../node.js/messaging#event-mesh-shared){:.learn-more}

3. Create a service key for your Event Mesh instance [→ see help.sap.com](https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/4514a14ab6424d9f84f1b8650df609ce.html)

4. Bind to your Event Mesh instance's service key from `reviews` and `bookstore`:

    ```sh
    cds bind -2 <instance>:<service-key>
    ```


    [Learn more about `cds bind` and hybrid testing.](../../advanced/hybrid-testing){:.learn-more}

5. Run your services in separate terminal shells with the `hybrid` profile:

    ```sh
    cds watch reviews --profile hybrid
    ```
    ```sh
    cds watch bookstore --profile hybrid
    ```

    [Learn more about `cds.env` profiles.](../../node.js/cds-env#profiles){:.learn-more}

6. Test your app [as described in the messaging guide](./#3-add-or-update-reviews).


### CAP Automatically Creates Queues and Subscriptions

When you run the services with a bound instance of SAP Event Mesh as documented in a previous section, CAP messaging service implementations will automatically create a queue for each receiver process. The queue name is chosen automatically and the receiver's subscriptions added.


### Optional: Configure Queue Names

In case you want to manage queues yourself, use config option `queue.name` as follows:

```jsonc
"cds": {
  "requires": {
    "messaging": { // ...
      "queue": { "name": "$namespace/my/own/queue" }
    }
  }
}
```

In both cases — automatically chosen queue names or explicitly configured ones — if the queue already exists it's reused, otherwise it's created.

[Learn more about queue configuration options.](../../node.js/messaging#message-brokers){:.learn-more}


## Deploy to the Cloud (with MTA)

A general description of how to deploy CAP applications to SAP BTP's Cloud Foundry, can be found in the [Deploy to Cloud* guide](../deployment). As documented there, MTA is frequently used to deploy to SAP BTP. Follow these steps to ensure binding of your deployed application to the SAP Event Mesh instance.


### 1. Specify Binding to SAP Event Mesh Instance

Add SAP Event Mesh's service instance's name to the `requires` section of your CAP application's module, and a matching entry to the `resources` section, for example:

```yaml
modules:
  - name: bookstore-srv
    requires:
      - name: <Event Mesh Service Instance - Name>

resources:
  # SAP Event Mesh
  - name: <Event Mesh Service Instance - Name>
    type: org.cloudfoundry.managed-service
    parameters:
      service: enterprise-messaging
      service-plan: <Event Mesh Service Instance - Plan>
```

[Learn more about using MTA.](../deployment){:.learn-more}

::: warning
Make sure to use the exact `name` and `service-plan` used at the time creating the service instance you want to use.
:::


### 2. Optional: Auto-Create SAP Event Mesh Instances

MTA can also create the service instance automatically. To do so, you need to additionally provide a service descriptor file and reference that through the `path` parameter in the `resources` section:

```yaml
resources:
  # SAP Event Mesh as above...
    parameters:
      path: ./<Event Mesh Service Descriptor JSON file>
```

[Learn more about Service Descriptors for SAP Event Mesh.](https://help.sap.com/docs/SAP_EM/bf82e6b26456494cbdd197057c09979f/5696828fd5724aa5b26412db09163530.html){:.learn-more}


## Setup for Multitenancy {:#multitenancy .impl.internal}

CAP's support for SAP Event Mesh includes advanced support and optimizations for multitenant usage.

<!-- TODO: revisit -->
<div class='tip' markdown="1">

**Behind the Scenes** — In multitenant mode the `enterprise-messaging` implementation additionally cares for:

- Onboarding SaaS tenants → Creating SAP Event Mesh client instances
- Using HTTP-based protocols instead of AMQP for better scalability
- Providing webhook endpoints and registering them with SAP Event Mesh
- Tenant-specific handshaking

</div>


### Using HTTP-Based Protocols by Default

SAP Event Mesh can be used using [different protocols, like AMQP, MQTT or REST APIs](https://help.sap.com/docs/SAP_EM/bf82e6b26456494cbdd197057c09979f/3f424ff1ae3b4bc084c4f1ea0be96f54.html). AMQP is connection-based which frequently creates resource and scalability issues for multitenant operations. Therefore, when in multitenant mode, the `enterprise-messaging` implementation uses [REST APIs, with webhooks for inbound messages](https://help.sap.com/docs/SAP_EM/bf82e6b26456494cbdd197057c09979f/00d56d697c7549408cfacc8cb6a46b11.html).


### 1. Configure Event Mesh Instance for Multitenancy

You need to configure SAP Event Mesh to enforce tenant isolation by having one dedicated event bus per tenant. This can be achieved by setting the instance type to reuse in the [service descriptor](https://help.sap.com/docs/SAP_EM/bf82e6b26456494cbdd197057c09979f/5696828fd5724aa5b26412db09163530.html) as follows:

```json
{
  "instanceType": "reuse"
}
```


### 2. Ensure to Use `enterprise-messaging`

Add the following to your _package.json_ to ensure using the multitenancy-aware variant of SAP Event Mesh:

```jsonc
"cds": {
  "requires": {
    "messaging": {
      "[production]": { "kind": "enterprise-messaging" },
    }
  }
}
```

[Learn more about `cds.env` profiles.](../../node.js/cds-env#profiles){:.learn-more}


### 3. Secure Inbound Access to HTTP Webhooks

Incoming messages are delivered by SAP Event Mesh to webhook endpoints of the SaaS application. To make this endpoint accessible for SAP Event Mesh, you need to grant the respective authority, for example like this in the XSUAA service descriptor _xs-security.json_:

```jsonc
{
  "scopes": [
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

[Learn more about **XSUAA configuration**.](../authorization#xsuaa-configuration){:.learn-more}

In addition, you've to let your SAP Event Mesh instance accept the granted authorities. Add `$ACCEPT_GRANTED_AUTHORITIES` to the `authorities` array in the service descriptor of your SAP Event Mesh instance:

```js
{
  [...],
  "instanceType": "reuse",
  "authorities": [
    "$ACCEPT_GRANTED_AUTHORITIES"
  ]
}
```


### 4. Deploy Your App with Profile `multitenancy`

Finally deploy your application for multitenant usage as described in the [Multitenancy](../deployment/as-saas) guide and the [Java companion](../../java/multitenancy) to it.



## Onboarding Tenants {:.impl.internal}

CAP's `enterprise-messaging` implementation plugs in to `@sap/cds-mtx` to fully automate tenant onboarding for SAP Event Mesh as follows:

* **Creating Isolated Event Mesh Instances** — The SAP Event Mesh service is included in response to Cloud Foundry's SaaS provisioning service's check for dependencies → in response to that the SaaS provisioning service creates the tenant's dedicated event bus.

* **Creating Queues on Subscriptions** — Once the tenant's event bus has been created, the SaaS provisioning service calls the subscription path, which triggers the process of creating all required queues and webhook subscriptions.


### Important: Use Asynchronous Onboarding

As the creation of the event bus **can take up to several minutes**, it's important to inform the SaaS provisioning service to make this process asynchronous. Do so by setting these properties in the [SaaS provisioning service's service descriptor](https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/3971151ba22e4faa9b245943feecea54.html):

```json
 "onSubscriptionAsync": true,
 "callbackTimeoutMillis": 600000
```

In case of Java, you additionally need to set `CDS_MULTITENANCY_CALLBACKURL`, as documented [here](../../java/multitenancy#asynchronous-tenant-subscription).


## Upgrading Tenants {:.impl.internal}

When upgrading deployed applications **new subscriptions are currently not propagated to already onboarded tenants** → as a temporary work-around to compensate for this, a REST API is provided to trigger that manually. Calling this REST API requires the caller to have a role that includes the scope `$XSAPPNAME.emmanagement`.

_❗ Warning_{:.warning-title}
As soon as a better integration into the SaaS management processes is found, the provided REST APIs will be deprecated and removed.
{:.warning}

To create the messaging infrastructure for existing tenants you have to trigger the tenant update by the SaaS provisioning service. The tenant update only updates the messaging-related configuration, such as related queues, topic subscriptions and webhook registrations. 
{:.tip}

### For Node.js

To update one, multiple, or all tenants to the current messaging-related configuration of the app, the following HTTP endpoint can be used:

```http
POST <APP_URL>/messaging/enterprise-messaging/deploy HTTP/1.1
Content-Type: application/json

{
  "tenants": ["<TENANT_ID_1>", ...], // or ["all"] (default: ["all"])
  "queues": ["<QUEUE_NAME_1>", ...] // or ["all"] (default: ["all"])
}
```

Alternatively, you can run the following task on Cloud Foundry:

```bash
cf run-task <YOUR_APP> "node node_modules/@sap/cds/tasks/enterprise-messaging-deploy.js"
```


### For Java

Upgrade one specific tenant, or all tenants:

```http
PUT <APP_URL>/messaging/v1.0/em/[<TENANT_ID>] HTTP/1.1
```

Get the configuration status of a specific, or all tenants:

```http
GET <APP_URL>/messaging/v1.0/em/[<TENANT_ID>] HTTP/1.1
```

## SAP Event Specifications {:.impl.internal}

SAP has sophisticated rules for constructing event messages:

1. [**SAP Event Specification**](https://github.tools.sap/CentralEngineering/sap-event-specification), part of [TG27](https://github.tools.sap/CentralEngineering/TechnologyGuidelines/tree/latest/tg27), is a stricter form of the [CloudEvents](https://cloudevents.io/) standard that all SAP-internal projects are asked to comply to.

2. [**SAP Event Mesh** has defined a mapping and rules](https://github.tools.sap/cloudevents/ems/blob/master/topics.md) how to construct valid message topics from the `source` and `type` properties.


### Using `cloudevents` With `enterprise-messaging`

CAP automatically creates messages, which comply to both by using format `cloudevents` in combination with `enterprise-messaging`, for example:

```json
"cds": {
  "requires": {
    "messaging": {
      "kind": "enterprise-messaging",
      "format": "cloudevents"
    }
  }
}
```


### Special `$namespace/ce/` Prefixing by Default

To comply to [SAP Event Mesh's mapping rules for CloudEvents messages](https://github.tools.sap/cloudevents/ems/blob/master/topics.md), the `enterprise-messaging` implementation with `format: cloudevents` automatically prefixes topic names when emitting or subscribing to events, as if configured like that:

```jsonc
"cds": {
  "requires": {
    "messaging": {
      "kind": "enterprise-messaging",
      "format": "cloudevents",
      // implicitly applied default prefixes
      "publishPrefix": "$namespace/ce/",
      "subscribePrefix": "+/+/+/ce/"
     }
  }
}
```

> Explicitly override these settings if you want a different prefixing.


### Special Topic Rewriting Applied

Also to comply to [SAP Event Mesh's mapping rules for CloudEvents messages](https://github.tools.sap/cloudevents/ems/blob/master/topics.md), dots in event names are replaced by slashes when generating topic names, and the `source` header field is derived based on the set `publishPrefix`:

| publishPrefix            | derived source      |
| ------------------------ | ------------------- |
| `my/own/namespace/ce/`   | `/my/own/namespace` |
| `my/own.namespace/-/ce/` | `/my/own.namespace` |


## SAP Message Queuing {: .impl.internal}

When using SAP Message Queuing as messaging service (only available to SAP-internal stakeholders using `kind: message-queuing`), all dots in the event name are automatically replaced by slashes, as SAP Message Queuing doesn't allow dots to appear in topics.

Example:

`my.custom.topic` is changed to `my/custom/topic`.
