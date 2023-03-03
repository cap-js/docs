---
synopsis: Looking for the obligatory greeting? &rarr; here you go.
# permalink: /get-started/hello-world/
status: released
---

<!--@include: ../links.md-->

# Hello World!

Let's create a simple _Hello World_ OData service using the SAP Cloud Application Programming Model in six lines of code and in under 2 minutes.
You can also download the [sample from github.com](https://github.com/sap-samples/cloud-cap-samples/tree/master/hello).

## Define a Service
... using [CDS].

File _srv/world.cds_, content:
```cds
service say {
  function hello (to:String) returns String;
}
```



## Implement it

... for example, using [Node.js](../node.js) express.js handlers style.

File _srv/world.js_, content:
```js
module.exports = (say)=>{
  say.on ('hello', req => `Hello ${req.data.to}!`)
}
```

... or [Node.js](../node.js) es6 classes style.

File _srv/world.js_, content:
```js
module.exports = class say {
  hello(req) { return `Hello ${req.data.to}!` }
}
```
> That has limited flexibility, for example, you can register only one handler per event.


## Run it
... for example, from your command line in the root directory of your "Hello World":
```sh
cds watch
```

## Consume it
... for example, from your browser:<br>

<http://localhost:4004/say/hello(to='world')>
<!-- <http://localhost:4004/say/hello?to=world> -->
