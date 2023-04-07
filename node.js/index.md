---
section: Node.js
status: released
---
<!--- Migrated: @external/node.js/index.md -> @external/node.js/index.md -->

# CAP Service SDK for Node.js
Reference Documentation
{ .subtitle}


<!-- % include links-for-node.md %} -->


## Introduction

As an application developer you'd primarily use the Node.js APIs documented herein to implement **domain-specific custom logic** along these lines:

1. Define services in CDS &rarr; see [Cookbook > Providing & Consuming Services](../guides/providing-services/#defining-services)
2. Add service implementations &rarr; [`cds.Service` > Implementations](./services#srv-impls)
3. Register custom event handlers in which &rarr; [`srv.on`/`before`/`after`](./services#event-handlers)
4. Read/write data from other services in which &rarr; [`srv.run`](./services#srv-run) + [`cds.ql`](./cds-ql)
5. ..., i.e. from your primary database &rarr; [`cds.DatabaseService`](./databases)
5. ..., i.e. from other connected services &rarr; [`cds.RemoteService`](./remote-services)
6. Emit and handle asynchronous events &rarr; [`cds.MessagingService`](./messaging)

All the rest is largely handled by the CAP runtime framework behind the scenes.
This especially applies to bootstrapping the [`cds.server`](./cds-serve) and the generic features
provided through [`cds.ApplicationService`](./app-services).


<!-- ## Content {#toc}


<style scoped > ul strong { font-weight: 500 } </style>
{#markdown-toc class="sidebar menu"}
- [cds API Facade](cds-facade)
- [cds.**Service** APIs](services)
- [cds.**Requests**](events)
- [cds.**Events**](events)
- [cds.compile](cds-compile)
- [cds.connect](cds-connect)
- [cds.context/tx](cds-context-tx)
- [cds.env](cds-env)
- [cds.log](cds-log)
- [cds.reflect](cds-reflect)
- [cds.serve/r](cds-serve)
- [cds.test](cds-test)
- [cds.ql](cds-ql)
- [cds.deploy <i> {{_res}} db </i>](cds-deploy)
- [Best Practices](best-practices)
- [Middlewares](middlewares)
- [Authentication](authentication)
- [Inbound Protocols](protocols)
- [Application Services](app-services)
- [Remote Services](remote-services)
- [Transactions](cds-context-tx)
- [Databases](databases)
- [Messaging](messaging) % if jekyll.environment != "external" %}
- [Audit Logging](platform-services) % endif %}
- [Using Typescript](typescript)
- [**@sap/cds-dk** APIs](cds-dk) -->


## Conventions

We use the following notations in method signatures:


Read them as follows:

* `param?` --- appended question marks denote optional parameters
* &#8674; `result` --- solid line arrows: **returns** the given result
* &#8594; `result` --- dashed arrows: **returns a _[Promise]_ resolving to** the given result
* `...` --- denotes a fluent API, eventually returning/resolving to given result
* _<i>&#8627;</i>_ --- denotes subsequent methods to add options in a fluent API

