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
| [Project Setup & Layouts](../get-started/projects#sharing-and-reusing-content)    | [`./`](https://github.com/SAP-samples/cloud-cap-samples/edit/main/bookshop/)                           |
| [Domain Modeling with CDS](../guides/domain-models)                               | [`./db/schema.cds`](https://github.com/SAP-samples/cloud-cap-samples/edit/main/bookshop/db/schema.cds) |
| [Defining Services](../guides/providing-services#defining-services)                         | [`./srv/*.cds`](https://github.com/SAP-samples/cloud-cap-samples/edit/main/bookshop/srv)               |
| [Single-purposed Services](../guides/providing-services#single-purposed-services)           | [`./srv/*.cds`](https://github.com/SAP-samples/cloud-cap-samples/edit/main/bookshop/srv)               |
| [Providing & Consuming Providers](../guides/providing-services)                   | http://localhost:4004                |
| [Using Databases](../guides/databases)                                            | [`./db/data/*.csv`](https://github.com/SAP-samples/cloud-cap-samples/edit/main/bookshop/db/data)       |
| [Adding Custom Logic](../guides/service-impl)                                     | [`./srv/*.js`](https://github.com/SAP-samples/cloud-cap-samples/edit/main/bookshop/srv)                |
| Adding Tests                                                                                              | [`./test`](https://github.com/SAP-samples/cloud-cap-samples/edit/main/bookshop/test)                   |
| [Sharing for Reuse](../guides/reuse-and-compose)                                  | [`./index.cds`](https://github.com/SAP-samples/cloud-cap-samples/edit/main/bookshop/index.cds)         |


### Bookstore

#### Hypothetical Use Cases

1. Compose a service based on existing services.
1. Use messaging
1. Send and react on events


##### Content & Best Practices

| Links to capire                                                                                           | Sample files / folders               |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| [Messaging](../get-started/projects#sharing-and-reusing-content)    | [`./package.json`](https://github.com/SAP-samples/cloud-cap-samples/blob/4a8b71c6f9689df6e9212aa6d8615fd788b6a80b/bookstore/package.json#L23)                           |
</div>

<div class="impl java">

[Samples for **Java**](https://github.com/SAP-samples/cloud-cap-samples-java), and

</div>

## [Sample for **SAP Fiori**](https://github.com/SAP-samples/cap-sflight)




## SuSaaS

*Explore a multitenant CAP application**](https://github.com/SAP-samples/btp-cf-cap-multitenant-susaas)