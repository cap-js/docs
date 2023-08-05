---
synopsis: >
  Looking for the obligatory greeting? &rarr; here you go.
notebook: true
status: released
impl-variants: true
---

# Hello World!

<div class="impl node">

Let's create a simple  _Hello World_ OData service using the SAP Cloud Application Programming Model in six lines of code and in under 2 minutes.

You can also download the [sample from github.com](https://github.com/sap-samples/cloud-cap-samples/tree/main/hello).

</div>

<div class="impl java">

Let's create a simple _Hello World_ OData service using the SAP Cloud Application Programming Model with a few lines of code and in under 2 minutes.

</div>


## Create a Project

<div class="impl node">

```sh
cds init hello-world --add samples
cd hello-world
```

</div>

<div class="impl java">

```sh
cds init hello-world --add java,samples
cd hello-world
```

> With the `cds init` command above you also created a sample schema and service. It's not relevant and can be ignored for now, but a CAP Java service currently needs persistence in order to startup correctly.

</div>

## Define a Service
... using [CDS](../cds/):

::: code-group

```cds [srv/world.cds]
service say {
  function hello (to:String) returns String;
}
```
:::


## Implement it

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


## Run it
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


## Consume it
... for example, from your browser:<br>

<http://localhost:4004/odata/v4/say/hello(to='world')>  { .impl .node}

<http://localhost:8080/odata/v4/say/hello(to='world')> { .impl .java}

You should see the value "Hello world!" being returned.

<!--- % include links.md %} -->
