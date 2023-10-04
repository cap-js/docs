---
status: released
impl-variants: true
---

# Samples overview


## Hello World


<div class="impl node">

Let's create a simple  _Hello World_ OData service using the SAP Cloud Application Programming Model in six lines of code and in under 2 minutes.

You can also download the [sample from github.com](https://github.com/sap-samples/cloud-cap-samples/tree/main/hello).

</div>

<div class="impl java">

Let's create a simple _Hello World_ OData service using the SAP Cloud Application Programming Model with a few lines of code and in under 2 minutes.

</div>


### Create a Project

<div class="impl node">

```sh
cds init hello-world --add tiny-sample
cd hello-world
npm install
```

</div>

<div class="impl java">

```sh
cds init hello-world --add java,samples
cd hello-world
```

> With the `cds init` command above you also created a sample schema and service. It's not relevant and can be ignored for now, but a CAP Java service currently needs persistence in order to startup correctly.

</div>

### Define a Service
... using [CDS](../cds/):

::: code-group

```cds [srv/world.cds]
service say {
  function hello (to:String) returns String;
}
```
:::


### Implement it

<div class="impl node">

... for example, using [Node.js](../node.js/) express.js handlers style.

</div>

::: code-group

```js [srv/world.js]
module.exports = (say)=>{
  say.on ('hello', req => `Hello ${req.data.to}!`)
}
```
:::

... or [Node.js](../node.js/) ES6 classes style.

::: code-group

```js [srv/world.js]
module.exports = class say {
  hello(req) { return `Hello ${req.data.to}!` }
}
```
:::

> That has limited flexibility, for example, you can register only one handler per event. { .impl .node}

<div class="impl java">

... for example, using a [CAP Java](../java/provisioning-api) custom handler like this:

::: code-group

```java [srv/src/main/java/customer/hello_world/handlers/HelloHandler.java]
package customer.hello_world.handlers;

import org.springframework.stereotype.Component;

import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;

import cds.gen.say.HelloContext;
import cds.gen.say.Say_;

@Component
@ServiceName(Say_.CDS_NAME)
public class HelloHandler implements EventHandler {

  @On
  public void onHello(HelloContext ctx) {
    ctx.setResult("Hello " + ctx.getTo());
    ctx.setCompleted();
  }

}
```
:::

</div>


### Run it
... for example, from your command line in the root directory of your "Hello World":

::: code-group

```sh [Node.js]
cds watch
```

```sh [Java]
cd srv
mvn cds:watch
```

:::


### Consume it
... for example, from your browser:<br>

<http://localhost:4004/odata/v4/say/hello(to='world')>  { .impl .node}

<http://localhost:8080/odata/v4/say/hello(to='world')> { .impl .java}

You should see the value "Hello world!" being returned.

## CAP Samples

<div class="impl node">

[**Samples** **for Node.js**](https://github.com/SAP-samples/cloud-cap-samples),

This set of samples cover several distinct use cases.


| Sample  |Use Case  |
|---------|---------|
|[bookshop](#bookshop-node)     |  Introduces the essential tasks in the development of CAP-based services as also covered in the [Getting Started](in-a-nutshell) guide.       |
|[bookstore](#bookstore)     |  Shows how service consumption works and also showcases messaging and eventing.       |
|common     |         |
|data-viewer     |         |
|fiori     |         |
|hello     |         |
|loggers     |         |
|media     |         |
|orders     |         |
|reviews     |         |

### Bookshop { #bookshop-node}



#### Hypothetical Use Cases

1. Build a service that allows to browse _Books_ and _Authors_.
2. Books have assigned _Genres_, which are organized hierarchically.
3. All users may browse books without login.
4. All entries are maintained by Administrators.
5. End users may order books (the actual order mgmt being out of scope).


##### Content & Best Practices

| Links to capire                                                                                           | Sample files / folders               |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| [Project Setup & Layouts](../get-started/jumpstart#project-structure)    | [`./`](https://github.com/SAP-samples/cloud-cap-samples/edit/main/bookshop/)                           |
| [Domain Modeling with CDS](../guides/domain-modeling)                               | [`./db/schema.cds`](https://github.com/SAP-samples/cloud-cap-samples/edit/main/bookshop/db/schema.cds) |
| [Defining Services](../guides/providing-services#modeling-services)                         | [`./srv/*.cds`](https://github.com/SAP-samples/cloud-cap-samples/edit/main/bookshop/srv)               |
| [Single-purposed Services](../guides/providing-services#single-purposed-services)           | [`./srv/*.cds`](https://github.com/SAP-samples/cloud-cap-samples/edit/main/bookshop/srv)               |
| [Providing & Consuming Providers](../guides/providing-services)                   | http://localhost:4004                |
| [Using Databases](../guides/databases)                                            | [`./db/data/*.csv`](https://github.com/SAP-samples/cloud-cap-samples/edit/main/bookshop/db/data)       |
| [Adding Custom Logic](../guides/providing-services#adding-custom-logic)                                     | [`./srv/*.js`](https://github.com/SAP-samples/cloud-cap-samples/edit/main/bookshop/srv)                |
| Adding Tests                                                                                              | [`./test`](https://github.com/SAP-samples/cloud-cap-samples/edit/main/bookshop/test)                   |
| [Sharing for Reuse](../guides/extensibility/composition)                                  | [`./index.cds`](https://github.com/SAP-samples/cloud-cap-samples/edit/main/bookshop/index.cds)         |


### Bookstore

#### Hypothetical Use Cases

1. Compose a service based on existing services.
1. Use messaging
1. Send and react on events


##### Content & Best Practices

| Links to capire                                                                                           | Sample files / folders               |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| [Messaging](../get-started/jumpstart#project-structure)    | [`./package.json`](https://github.com/SAP-samples/cloud-cap-samples/blob/4a8b71c6f9689df6e9212aa6d8615fd788b6a80b/bookstore/package.json#L23)                           |
</div>

<div class="impl java">

The main sample application for CAP Java is the [Bookshop](https://github.com/SAP-samples/cloud-cap-samples-java). In this sample app we showcase most of the CAP Java features. Additionally, there is the [CAP SFlight](https://github.com/SAP-samples/cap-sflight) which runs on both stacks, CAP Java and CAP node.js.


| Feature              | Showcased in                                |
|----------------------|---------------------------------------------|
|Domain Modeling       |  Introduces the essential tasks in the development of CAP-based services as also covered in the [Getting Started](in-a-nutshell) guide. More advanced examples for domain modeling can be found in the [SFlight model](https://github.com/SAP-samples/cap-sflight/blob/main/db/schema.cds) as well as in the [Bookshop model](https://github.com/SAP-samples/cloud-cap-samples-java/blob/main/db/books.cds).|
|Providing Services    |  See different examples how domain models can be exposed as outbound services (defaults to OData V4). The [TravelService in CAP SFlight](https://github.com/SAP-samples/cap-sflight/blob/main/srv/travel-service.cds) does a straight forward projection of the Travel entity plus annotations for authorization. The [AdminService in the Bookshop](https://github.com/SAP-samples/cloud-cap-samples-java/blob/main/srv/admin-service.cds) shows a bit more advanced service exposere of entities plus the extension of existing entities via predefined annoations.|
|Consuming Services    |         |
|Databases             |         |
|Messaging             |         |
|Authorization         |         |
|Localization          |         |
|Localized Data        |         |
|Temporal Data         |         |
|Media Data            |         |
|Data Privacy          |         |

### Bookshop { #bookshop-java}

The [bookshop-java is a sample application modeling a bookshop. From a domain point of view the bookshop offers
functionality for browsing and managing books as well as managing orders. All of the major features of CAP Java are incorporated in one or another way in the code base of this single application.

Among others they include

* [Authorization and authentication](https://cap.cloud.sap/docs/java/security) in [selected services](https://github.com/SAP-samples/cloud-cap-samples-java/blob/main/srv/admin-service.cds)
* Integrate [Business Partner events](https://github.com/SAP-samples/cloud-cap-samples-java/blob/04dd881be4ec6fd33c318f449cb5880d27783275/srv/external.cds#L12C3-L13C3) via [Messaging](https://cap.cloud.sap/docs/java/messaging-foundation)
* Integrate [Business Partner Adresses](https://github.com/SAP-samples/cloud-cap-samples-java/blob/04dd881be4ec6fd33c318f449cb5880d27783275/srv/external/API_BUSINESS_PARTNER.cds#L12) via remote service consumption
* Usage of [feature toggles](https://cap.cloud.sap/docs/guides/extensibility/feature-toggles) to provide [features to selected users](https://github.com/SAP-samples/cloud-cap-samples-java/blob/04dd881be4ec6fd33c318f449cb5880d27783275/srv/src/main/java/my/bookshop/config/CustomFeatureToggleProvider.java#L22)

For a more detailed list you can visit the [README of the Java bookshop](https://github.com/SAP-samples/cloud-cap-samples-java/blob/main/README.md).

</div>

## [CAP SFlight](https://github.com/SAP-samples/cap-sflight)

The CAP SFlight sample application is the the CAP counterpart to the [ABAP Flight Scenario sample application](https://github.com/SAP-samples/abap-platform-refscen-flight). While modeling the domain of travel booking and travel management the application showcases close integration and use of different Fiori Element UI features including [draft handling](https://experience.sap.com/fiori-design-web/draft-handling/) and [ALP (analytical list page)](https://experience.sap.com/fiori-design-web/analytical-list-page/). In contrast to other sample applications CAP SFlight is a dual-stack application: both runtime stacks Java and node.js can be started for the same project.

## SuSaaS

*Explore a multitenant CAP application**](https://github.com/SAP-samples/btp-cf-cap-multitenant-susaas)