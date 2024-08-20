# Using SAP Event Broker in Cloud Foundry

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



## Consuming Events in a Stand-alone App

This guide describes the end-to-end process of developing a stand-alone (or "single tenant") CAP application that consumes messages via SAP Event Broker.
The guide uses SAP S/4HANA as the event emitter, but this is a stand-in for any system that is able to publish cloud events via SAP Event Broker.

Sample app: [@capire/incidents with Customers based on S/4's Business Partners](https://github.com/cap-js/incidents-app/tree/event-broker)


### Prerequisite: Events & Messaging in CAP

From the perspective of a CAP developer, SAP Event Broker is yet another messaging broker.
That is to say, CAP developers focus on [modeling their domain](../domain-modeling) and [implementing their domain-specific custom logic](../providing-services#custom-logic).
Differences between the various event transporting technologies are held as transparent as possible.

Hence, before diving into this development guide, you should be familiar with the general guide for [Events & Messaging in CAP](../messaging/), as it already covers the majority of the content.


### Prerequisite: Setup SAP Event Broker

Follow guide _SAP Event Broker Service Guide_ &rarr; _Integration Scenarios_ &rarr; [CAP Application as a Subscriber](https://help.sap.com/docs/event-broker/event-broker-draft-service/integration-example-using-cap-application?state=DRAFT) to prepare your SAP BTP account for event consumption.


### Add Events and Handlers

There are three options for adding the events that shall be consumed to your model, and subsequently registering event handlers for the same.

#### 1. Import and Augment

This approach is described in [Events from SAP S/4HANA](../messaging/#events-from-sap-s-4hana), [Receiving Events from SAP S/4HANA Cloud Systems](../messaging/s4), and specifically [Consume Events Agnostically](../messaging/s4#consume-events-agnostically) regarding handler registration.

#### 2. Decoupled

In the second option, you define the event manually in any service, but link it to the respective cloud event type via `@topic`.

```cds
service Foo {
  event Bar @(topic:'my.name.space.myentity.myoperation.v1') {
    baz: String;
  }
}
```
```js
Foo.on('Bar', msg => { ... })
```

#### 3. Using Low-Level Messaging

As a third option, you can skip the modeling part and simply use [Low-Level Messaging](../messaging/s4#using-low-level-messaging).
However, please note that future [Open Resource Discovery (ORD)](https://sap.github.io/open-resource-discovery/) integration will most likely benefit from modeled approaches.


### Use `event-broker`

Add the following to your _package.json_ to use SAP Event Broker:

```jsonc
"cds": {
  "requires": {
    "messaging": {
      "[production]": {
        "kind": "event-broker"
      }
    }
  }
}
```

[Learn more about `cds.env` profiles](../../node.js/cds-env#profiles){.learn-more}

For more details, see _Node.js_ &rarr; _Messaging_ &rarr; _Message Brokers_ &rarr; [SAP Event Broker](../../node.js/messaging#sap-event-broker).


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
