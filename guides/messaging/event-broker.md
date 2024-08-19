# Using SAP Event Broker in Cloud Foundry (Beta)

[SAP Event Broker](https://help.sap.com/docs/event-broker) is the new default offering for messaging in SAP Business Technology Platform (SAP BTP).
CAP provides growing out-of-the-box support for SAP Event Broker, and automatically handles many things behind the scenes, so that application coding stays agnostic and focused on conceptual messaging.

::: warning
Only available for Node.js. Java to follow soon.
:::

::: warning
The following guide is based on a productive (paid) account on SAP BTP.
:::

[[toc]]

<span id="eventbrokerfeaturematrix" />


<!--

// --- HERE

-->


## Consuming Events in a Stand-alone App

This guide describes the end-to-end process of developing a stand-alone (or "single tenant") CAP application that consumes messages via SAP Event Broker.
The guide uses SAP S/4HANA as the event emitter, but this is a stand-in for any system that is able to publish cloud events via SAP Event Broker.

Example: [@capire/incidents with Customers based on S/4's Business Partners](https://github.com/cap-js/incidents-app/tree/event-broker)


### Prerequisite: Events & Messaging in CAP

From the perspective of a CAP developer, SAP Event Broker is yet another messaging broker.
That is to say, CAP developers focus on [modeling their domain](../domain-modeling) and [implementing their domain-specific custom logic](../providing-services#custom-logic).
Differences between the various event transporting technologies are held as transparent as possible.

Hence, before diving into this development guide, you should be familiar with the general guide for [Events & Messaging in CAP](../messaging/), as it already covers the majority of the content.


<!--

### Entitlements → TODO for EB

- SAP Event Broker Application (entitlement + subscription)
- Event Connectivity Service Plan (entitlement only, see _Deploy with MTA_ below)
- `event-mesh-single-tenant` for [Event Broker "Sibling"](#create-event-broker-sibling-for-s-4hana-cloud-→-todo-for-eb)


### Add SAP S/4HANA Cloud to Global Account in SAP BTP → TODO for EB

guides:
1. [Register an SAP S/4HANA Cloud System in a Global Account in SAP BTP](https://help.sap.com/docs/btp/sap-business-technology-platform/register-sap-s-4hana-cloud-system-in-global-account-in-sap-btp)
2. [Trigger the Registration in the SAP S/4HANA Cloud Tenant](https://help.sap.com/docs/btp/sap-business-technology-platform/trigger-registration-in-sap-s-4hana-cloud-tenant)


### Create Event Broker "Sibling" for S/4HANA Cloud → TODO for EB

Prerequisite for getting `amqpGatewayURL` that is needed in step "Create Communication Arrangement in SAP S/4HANA Cloud"!

__I wasn't able to find any documentation on this!!!__

1. Get entitlement `event-mesh-single-tenant`
2. Copy System ID of S/4HANA Cloud (see System Landscape)
3. Create service instance in _Runtime Environment_ "Other" with JSON:
  ```jsonc
  {
    "ceSource": ["/default/sap.s4/<System ID>"], //> the System ID as copied from System Landscape
    "displayName": "Event Broker for S/4HANA Cloud", //> any name you want to give
    "deploymentRegion": "default"
  }
  ```


### Create Communication Arrangement in SAP S/4HANA Cloud → TODO for EB

In your S/4HANA Cloud, create a so-called _Communication Arrangement_ that configures ...

Maybe based on:
- [Integration with SAP Event Broker](https://help.sap.com/docs/SAP_S4HANA_CLOUD/0f69f8fb28ac4bf48d2b57b9637e81fa/8ed53ec0f7544d7c8342db6e617127a1.html)?
- [Creating Communication Arrangements](https://help.sap.com/docs/SAP_S4HANA_CLOUD/0f69f8fb28ac4bf48d2b57b9637e81fa/980bd73175d44007b65e67b07eccb730.html)

Note: For getting `amqpGatewayURL` (Step 9), the formation that shall be created in [Create Formation → TODO for EB](#create-formation-→-todo-for-eb) below, already needs to exist... 


### Provide S/4HANA Cloud Certificate to Event Broker via Binding → TODO for EB

Cannot be done until Communication Arrangement (actually _Communication System_, but both are done in same guide) was created!

1. Get certificate from S/4HANA Cloud
  1. In the newly created Communication Arrangement, navigate to the newly created Communication System
  2. Click on _SSL Client Certificate_
  3. Click on _Display Certificate_
  4. Click on _Export_, select checkbox for `.pem`, and press _Export_
2. Provide certificate to Event Broker
  1. On service instance of plan `event-mesh-single-tenant`, create a "binding" (somewhat confusing wording as your not binding an app) with JSON:
  ```jsonc
  {
    "certificate": "-----BEGIN CERTIFICATE-----\nMII...\n-----END CERTIFICATE-----"
  }
  ```

-->


### Add Events to Model

Two options:
- Import and augment → see [Events from SAP S/4HANA](../messaging/#events-from-sap-s-4hana) and [Receiving Events from SAP S/4HANA Cloud Systems](../messaging/s4)
- Define manually:
  ```cds
  service Foo {
    event Bar @(topic:'my.name.space.myentity.myoperation.v1') {
      baz: String;
    }
  }
  ```

NOTE: Bare metal
```js
messaging.on('my.name.space.myentity.myoperation.v1', msg => { ... })
```
also works, but future ORD integration benefits from modeled approach.


<!--

### Generate Certificate → TODO for EB

How to fulfill prerequisite
`You have the private key of the certificate from a trusted Certificate Authority (CA).`
from [Creating Service Binding for Event Connectivity](https://help.sap.com/docs/event-broker/event-broker-service-guide/creating-service-binding-for-event-connectivity).

NOTE: PKI Service only available SAP-internally.

-->


### Use `event-broker`

Add the following to your _package.json_ to use SAP Event Broker:

```jsonc
"cds": {
  "requires": {
    "messaging": {
      "[production]": {
        "kind": "event-broker",
        "x509": {
          "certPath": "./certificate.pem",
          "pkeyPath": "./key.pem"
        }
      }
    }
  }
}
```

NOTE: `x509` section to be removed with IAS support.

For more details, see [Node.js → Messaging → Message Brokers → SAP Event Broker for SAP Cloud Applications](../../node.js/messaging#sap-event-broker-for-sap-cloud-applications).


### Deploy with MTA

Sample `mta.yml` that deploys the app while creating and binding the SAP Event Broker instance with the two respective configurations (→ minimize manual efforts!).

configs:
- instance: `systemNamespace` + `webhookUrl`
- binding:
  ```jsonc
  {
    "authentication-type": "X509_PROVIDED",
    "x509": {
      "outbound": {
          "certificate": "-----BEGIN CERTIFICATE-----\nMIIFuTCCA...vD4uOWDqNcaug=\n-----END CERTIFICATE-----",
          "key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBA...Yj6ZLnghA==\n-----END PRIVATE KEY-----"
      }
    }
  }
  ```


<!--

### Create System and Integration Dependency → TODO for EB

Manually add CAP app to _System Landscape_:

![](assets/event_broker_add_system.png)

And define its interest as _Integration Dependency_:

![](assets/event_broker_add_integration_dependency_1.png)
![](assets/event_broker_add_integration_dependency_2.png)
![](assets/event_broker_add_integration_dependency_3.png)


### Create Formation → TODO for EB

- Formation Type: _Eventing Between SAP Cloud Systems_
- System Types: _SAP S/4HANA Cloud_, _SAP Event Broker_, and _SAP BTP Application_ ([to be added](https://jira.tools.sap/browse/NGPBUG-398030))

Note: Until system type _SAP BTP Application_ is available, use formation type _Eventing Between SAP Cloud Systems Demo_ and system type _CAP Application_ instead.


### Enable Event Consumption → TODO for EB

In SAP Event Broker Application, ...

-->


### Check that it works

For example by triggering a respective event and locating the respective reception in application logs.

NOTE: we should allow testing via `internal-user` → only possible with ias-auth


### Hybrid Testing

Possible? If yes, how?



<span id="eventbrokersaasconsuming" />

<span id="eventbrokersaaspublishing" />
