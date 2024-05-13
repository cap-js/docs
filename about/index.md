---
section: About
status: released
---

<style scoped>
.cols-2 {
  display: flex;
  flex-wrap: wrap;
}
.cols-2 > * {
  width: 100%;
}
@media (min-width: 640px) {
  .cols-2 {
    gap: 1em;
  }
  .cols-2 > * {
    flex: 1;
    width: calc(100% / 2);
  }
}

</style>

# About CAP

The _SAP Cloud Application Programming Model_ (CAP) is a framework of **languages**, **libraries**, and **tools** for building enterprise-grade services and applications. It guides developers along a 'golden path' of proven [**best practices**](#enterprise-best-practices) and a great wealth of [**out-of-the-box solutions**](#generic-providers) to recurring tasks.

CAP-based projects benefit from a **[primary focus on domain](#domain-modeling)**. Instead of delving into overly technical disciplines, we focus on **[accelerated development](#grow-as-you-go)** and **[safeguarding investments](#agnostic-approach)** in a world of rapidly changing cloud technologies.

[[toc]]


## Overview {#overview}

The CAP framework features a mix of proven and broadly adopted open-source and SAP technologies, as highlighted in the figure below.

<img src="../assets/overview.drawio.svg" style="width:480px; margin: auto" alt="The graphic is explained in the accompanying text.">

<div id="logos" style="text-align:center;">
  <img src="../assets/logos/nodejs.svg" style="height:40px" alt="Node.js logo" />
  <img src="../assets/logos/express.png" style="height:34px" alt="Express logo"/>
  <img src="../assets/logos/java.svg" style="height:44px;margin-top:-10px;" alt="Java logo"/>
  <img src="../assets/logos/spring.svg" style="height:25px" alt="spring logo" />
</div>

<style scoped>
  #logos {
    margin: 24px auto;
    max-width: 280px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    justify-content: center;
    align-items: center;
    gap: 12px;
  }

  #logos img {
    margin: 4px auto;
  }

  @media (min-width: 500px) {
    #logos {
      max-width: 500px;
      grid-template-columns: repeat(4, 1fr); /* Four columns in one row for wider screens */
    }
  }
</style>

On top of open source technologies, CAP mainly adds:

- **Core Data Services (CDS)** as our universal modeling language for both domain models and service definitions.



- **Service SDKs and runtimes** for Node.js and Java, offering libraries to implement and consume services as well as generic provider implementations serving many requests automatically.




## Open _and_ Opinionated {#open-and-opinionated}

[SAP Fiori]: https://developers.sap.com/topics/ui-development.html
[SAP HANA]: https://developers.sap.com/topics/hana.html

That might sound like a contradiction, but isn't: While CAP certainly gives *opinionated* guidance, we do so without sacrificing openness and flexibility.  At the end of the day, **you stay in control** of which tools or technologies to choose, or which architecture patterns to follow as depicted in the table below.

| CAP is *Opinionated* in...                                   | CAP is *Open* as...                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| **Higher-level concepts and APIs** abstracting from and avoiding lock-ins to low-level platform features and protocols | All abstractions follow a glass-box pattern that allows unrestricted access to lower-level things, if required |
| **Best Practices served out of the box** with generic solutions for many recurring tasks | You can always handle things your way in [custom handlers](../guides/providing-services#custom-logic), decide whether to adopt [CQRS](#cqrs) or [Event Sourcing](#event-sourcing), for example ... while CAP simply tries to get the tedious tasks out of your way. |
| **Out-of-the-box support** for <br> **[SAP Fiori](https://developers.sap.com/topics/ui-development.html)** and **[SAP HANA](https://developers.sap.com/topics/hana.html)** | You can also choose other UI technologies, like [Vue.js](../get-started/in-a-nutshell#vue), or databases, by providing new database integrations. |
| **Dedicated tools support** provided in [SAP Business Application Studio](../tools/cds-editors#bas) or [Visual Studio Code](../tools/cds-editors#vscode). | CAP doesn't depend on those tools. Everything in CAP can be done using the [`@sap/cds-dk`](../get-started/jumpstart) CLI and any editor or IDE of your choice. |



## Agnostic Design {#agnostic-approach}

Keeping pace with a rapidly changing world of cloud technologies and platforms is a major challenge when having to hardwire too many things to today's technologies, which might soon become obsolete. **CAP avoids such lock-ins** through **higher-level concepts and APIs**, which abstract low-level platform features and protocols to a large extent. In particular, this applies to things like:

- Platform-specific deployment approaches and techniques
- Platform-specific identity providers and authentication strategies
- On-/Offboarding of tenants in SaaS solutions and tenant isolation
- Synchronous protocols like *REST*, *OData*, or *GraphQL*
- Asynchronous channels and brokers like *SAP Event Mesh*, *MQ*, or *Kafka*
- Different database technologies including *SQL* and *NoSQL*


These abstractions allow us to quickly adapt to new emerging technologies or platforms, without affecting application code, thus **safeguarding your investments**.


## Focus on Domain {#domain-modeling}
<!-- label='Focus on Domain, by CDS' -->

CAP places **primary focus on domain**, by capturing _domain knowledge_ and _intent_ instead of imperative coding — that means, _What, not How_ — thereby promoting:

- Close collaboration of _developers_ and _domain experts_ in domain modeling.
- _Out-of-the-box_ implementations for _best practices_ and recurring tasks.
- _Platform-agnostic_ approach to _avoid lock-ins_, hence _protecting investments_.

The figure below illustrates the prevalent use of CDS models (in the left column), which fuel generic runtimes, like the CAP service runtimes or databases.

![CDS models are used to define domain models, service models and UI markup. You can add custom code on top of them.](../assets/core-concepts.drawio.svg)
Anatomy of a Typical Application{.caption}

<br>

###### Core Data Services (CDS)

[CDS](../cds/) is our universal modeling language to capture static, as well as behavioral aspects of problem domains in **conceptual**, **concise**, and **comprehensible** ways, and hence serves as the very backbone of CAP.

<br>

###### Domain Models in CDS

<div class="cols-2">

<div>

```cds
entity Books : cuid {
  title  : localized String;
  author : Association to Authors;
}

entity Orders : cuid, managed {
  descr : String;
  Items : Composition of many {
    book : Association to Books;
    quantity : Integer;
  }
}
```

</div>

<div>

Domain Models capture static aspects of problem domains as well-known _entity-relationship models_.

**_[Associations](../cds/cdl#associations)_** capture relationships. _[Compositions](../cds/cdl#compositions)_ extend that to easily model **document structures**.

**_[Annotations](../cds/cdl#annotations)_** allow enriching models with additional metadata, such as for [UIs](../advanced/fiori), [Validations](../guides/providing-services#input-validation), [Input Validation](../guides/providing-services#input-validation) or [Authorization](../guides/security/authorization).

</div>

</div>

###### CDS Aspects & Mixins

<div class="cols-2">

<div>

```cds
// Separation of Concerns
extend Books with @restrict: [
  { grant:'WRITE', to:'admin' }
];

// Verticalization
extend Books with {
  ISBN : String
};

// Customization
extend Orders with {
  customer_specific : String
};
```

</div>

<div>

**_[Aspects](../cds/cdl#aspects)_** allow to flexibly **extend** models in same or separate modules, packages, or projects; at design time or dynamically at runtime.

This greatly promotes **[adaptability](../guides/extensibility/)** in _verticalization_ and _customization_ scenarios, especially in SaaS solutions.

Moreover, that fosters [**separation of concerns**](../guides/domain-modeling#separation-of-concerns), for example to keep domain models clean and comprehensible, by factoring out technical concerns.

</div>

</div>


## Querying & Views {#querying}
 <!-- label='Querying & Views' -->

All data access in CAP is through dynamic queries, which allows clients to request the exact information they really need. These powerful intrinsic querying capabilities are key enablers for **serving requests automatically**.

> Note: The querying-based approach to process data is in strong contrast to Object-Relational Mapping (→ see also *[Related Concepts: CAP != ORM](#orm)*)

<br>

###### Core Query Language (CQL)

<div>

**[CQL](../cds/cql)** is CDS's advanced query language. It enhances standard SQL with elements to easily query deeply nested **object graphs** and **document structures**. For example, here's a query in CQL:

```sql
SELECT ID, addresses.country.name from Employees
```
... and the same in plain SQL:
```sql
SELECT Employees.ID, Countries.name FROM Employees
 LEFT JOIN Addresses ON Addresses.emp_ID=Employees.ID
 LEFT JOIN Countries AS Countries ON Addresses.country_ID = Countries.ID
```

</div>

<br>

###### Queries as first-order Objects (CQN)

<div class="cols-2">

<div>

```js
// In JavaScript code
orders = await SELECT.from (Orders, o=>{
  o.ID, o.descr, o.Items (oi=>{
    oi.book.title, oi.quantity
  })
})
```

```http
// Via OData
GET .../Orders?$select=ID,descr
$expand=Items(
  $select=book/title,quantity
)
```

</div>

<div>

**Queries are first-order objects** – using [CQN](../cds/cqn) as a plain object notation – sent
to **local** services directly,
to **remote** services through protocols like *OData* or *GraphQL*,
or to **database** services, which translate them to native database queries for optimized execution with **late materialization**.

</div>

</div>

###### Projections at Design Time

<div class="cols-2">

<div>

```cds
// Projections in CDS
service OrdersService {
  define entity OrderDetails
  as select from Orders {
     ID, descr, Items
  }
}
```

</div>

<div>

We also use [CQL](../cds/cql) in CDS to declare [_de-normalized views_](../cds/cdl#views) on the underlying domain model, such as in tailored service APIs.

</div>

</div>

## Services & Events {#services}

All behavioral aspects in CAP are based on ubiquitous notions of [Services](#services) and [Events](#events), as expressed in this manifest:

1. _All active things are Services_ — local ones, remote ones, as well as databases
2. *Services are [declared in CDS](#service-definitions-in-cds)* — reflected and used in generic service providers
3. *Services [provide uniform APIs](#uniform-consumption)* — consumed by other services or frontends
4. _Services [react on Events](#events)_ — covering _synchronous_ and _asynchronous_ APIs
5. *Services [consume other Services](#uniform-consumption)* — in event handler implementations
6. _All data is passive_ — that is, without its own behavior, adhering to _REST_

Services in CAP are **stateless** and with a **minimal footprint**, which allows you to modularize solutions into single-purposed (nano) services or functions-as-a-service.

<figure>
  <img src="../assets/agnostic-services.drawio.svg" width="333px">
  <figcaption><a href="#hexagonal-architecture">Hexagonal Architecture à la CAP</a></figcaption>
</figure>

<br><br>


###### Service Definitions in CDS

<div class="cols-2">

<div>

```cds
// Service Definition in CDS
service OrdersService {
  entity Orders as projection on my.Orders;
  action cancelOrder (ID:Orders.ID);
  event orderCanceled : { ID:Orders.ID }
}
```

</div>

<div>

Services are declared in CDS models, used to [serve requests automatically](#generic-providers). They embody the behavioral aspects of a domain in terms of exposed **entities**, **actions**, and **events**.

</div>

</div>

###### Uniform Consumption

<div class="cols-2">

<div>

```js
// Consumption in JavaScript
let srv = cds.connect.to('OrdersService')
let { Orders } = srv.entities
order = await SELECT.one.from (Orders)
  .where({ ID:4711 })
srv.cancelOrder (order.ID)
```

```http
// Consumption via REST APIs
GET /orders/Orders/4711
POST /orders/cancelOrder/4711
```

</div>

<div>

**Every active thing in CAP is a service**, including *local* services or *remote* ones — even *databases* are represented as services.

All services provide a **uniform** API for programmatic consumption. Thus, application code stays **agnostic** to underlying protocols.

</div>

</div>

::: tip _[Late-cut µ services](../guides/providing-services#late-cut-microservices)_
This protocol-agnostic API allows [mocking remote services](../guides/using-services#local-mocking), as well as late changes to service topologies, for example, co-locating services in a single process or deploying them to separate micro services later on.
:::

<br>

###### Ubiquitous Events {#events}

<div class="cols-2">

<div>

```js
// Service Implementation
cds.service.impl (function(){
  this.on ('UPDATE','Orders', (req)=>{})
  this.on ('cancelOrder', (req)=>{})
})


// Emitting Events
// e.g. in this.on ('cancelOrder', ...)
let { ID } = req.data
this.emit ('orderCancelled', {ID})


// Subscribing to Events
let srv = cds.connect.to('OrdersService')
srv.on ('orderCancelled', (msg)=>{})
```

</div>

<div>

**Everything in CAP happens in response to events.** CAP features a ubiquitous notion of events, which represent both, *requests* coming in through **synchronous** APIs, as well as **asynchronous** *event messages*, thus blurring the line between both worlds.

We add custom logic in [event handlers](../guides/providing-services#event-handlers), registered to **implement** service operations. In the same way, we **subscribe** to asynchronous events emitted by other services.

</div>

</div>

::: tip _Domain-level Eventing_
Instead of talking to message brokers, services in CAP simply emit events on themselves, and consumers subscribe to events from services. Everything else is handled behind the scenes.
:::



## Served Out of the Box {#generic-providers}

The CAP runtimes in Node.js and Java provide many generic implementations for recurring tasks and best practices, distilled from proven SAP applications.
Benefits are significantly **accelerated** development, **minimized boilerplate** code, as well as **increased quality** through single points to fix and optimize.

Following is an excerpt of generic features provided:

###### Automatically Serving Requests

- [Serving CRUD Requests](../guides/providing-services#generic-providers)
- [Serving Nested Documents](../guides/providing-services#deep-reads-writes)
- [Serving Media Data](../guides/providing-services#serving-media-data)
- [Serving Draft Choreography](../advanced/fiori#draft-support)

###### Handling Recurring Tasks

- [Implicit Pagination](../guides/providing-services#implicit-pagination)
- [Input Validation](../guides/providing-services#input-validation)
- [Authentication](../node.js/authentication)
- [Authorization](../guides/security/authorization)
- [Localization / i18n](../guides/i18n)
- [Concurrency Control](../guides/providing-services#concurrency-control)

###### Enterprise Best Practices

- [Common Reuse Types & Aspects](../cds/common)
- [Managed Data](../guides/domain-modeling#managed-data)
- [Localized Data](../guides/localized-data)
- [Temporal Data](../guides/temporal-data)
- [Verticalization & Extensibility](../guides/extensibility/)

<br>

[See also the Features Overview](./features){.learn-more}



## Grow As You Go {#grow-as-you-go}
 <!-- label='Grow as You Go' -->

Following the principle of **convention over configuration**, there's no need to set up things upfront. CAP allows you to **jumpstart** projects within seconds and have a team starting development right away, using generic providers, on top of a lightweight in-memory database → see [*Getting Started in a Nutshell*](../get-started/in-a-nutshell).

CAP also offers **mocks for many platform features**, which allow **fast dev-test-run cycles** with minimal development environment complexity — aka *Airplane Mode*. Similarly, CAP greatly facilitates **integration scenarios** by simply importing an API from, say, an SAP S/4 backend or from SAP API Hub and running mocks for this locally.

Over time, you **add things gradually**, only when they're needed. For example, you can move ahead to running your apps in close-to-productive setups for integration tests and delivery, without any change in models or code. → see [*Grow-as-you-Go*](../get-started/grow-as-you-go).

Finally, projects are encouraged to **parallelize workloads**. For example, following a **contracts-first** approach, a service definition is all that is required to automatically run a full-fledged REST or OData service. So, projects could spawn two teams in parallel: one working on the frontend, while the other one works on the backend part. A third one could start setting up CI/CD and delivery in parallel.



## Features Overview

[See an overview of all features.](./features){.learn-more}





## Related Concepts


The sections below provide additional information about CAP in the context of, and in comparison to, these related concepts:

#### CAP == _Hexagonal Architecture_ {#hexagonal-architecture}

CAP's service architecture is designed with the same ideas in mind as the blueprints of _Hexagonal Architecture_ (or Onion Architecture, or Clean Architecture). With that, CAP facilitates projects that choose to apply the principles and designs of those architecture patterns. {.indent}


#### CAP promotes Domain-Driven Design {#domain-driven-design}

CAP greatly supports domain-driven design (DDD) by placing the primary focus on the problem domain, providing CDS as a powerful language to capture domain models and thereby facilitating close collaboration between domain experts and developers. CAP's core concepts fit well to the DDD counterparts of _Entities_, _Value Objects_, _Services_, and _Events_. {.indent}

In contrast to DDD however, CAP prefers a strong distinction of active services and passive data; for example, there's no such thing as instance methods of entities in CAP. CAP also stays at a more axiomatic level of key concepts: the DDD concepts of _Repositories_, _Aggregates_, and _Factories_ intentionally don't have first-class counterparts in CAP, but can be realized using CAP's core concepts. {.indent}


#### CAP promotes CQRS {#cqrs}

Similar to CQRS, CAP strongly recommends separating write APIs from read APIs by [defining separate, single-purposed services](../guides/providing-services#single-purposed-services). CDS's reflexive view building eases the task of declaring derived APIs exposing use case-specific de-normalized views on underlying domain models. Service actions in CAP can be used to represent pure commands. There's no restriction to 'verb-only' dogmas in CAP though, as CAP focuses on business applications, which are mostly data-oriented by nature, hence frequently 'entity/noun-centric'. {.indent}


#### CAP and Event Sourcing {#event-sourcing}

CAP can be combined with event sourcing patterns, that is, by tracking events in an event store, like Apache Kafka, instead of maintaining a snapshot of data in a relational or NoSQL database. Currently we don't provide out-of-the-box integration to such event sources (we may do so in near future), however this can be easily done in projects by respective service implementations using CAP's built-in capabilities to send and receive messages. {.indent}

#### CAP supports SQL {#sql}

CDS borrows reflexive view building from SQL to declare derived models and APIs as projections/transformation of underlying models, such as domain models. [CQL](../cds/cql) is based on SQL DML to allow direct mapping to SQL databases. However, it extends SQL with [Associations](../cds/cdl#associations), [Path Expressions](../cds/cql#path-expressions), and [Nested Projections](../cds/cql#nested-expands) to overcome the need to deal with JOINs. Instead, these extensions allow working with data in a structured document-oriented way. {.indent}


#### CAP supports NoSQL {#nosql}

The previously mentioned extensions in [CQL](../cds/cql) feature the modeling of nested document structures as well as view building and querying using navigation instead of cross products, joins, and unions. This actually brings CDS close to the concepts of NoSQL databases, with the data models playing the role of schemas for validation. Although CAP currently doesn't provide out-of-the-box support for concrete NoSQL databases, it's easy to do so in project-specific solutions. {.indent}


#### CAP and the Relational Model {#relational-model}

While CDS extends SQL and the relational model by means to describe, read, and write deeply nested document structures (see relationship to SQL below), it stays compatible to the principles of relational models with a specified mapping to relational databases. {.indent}


#### CAP == Entity-Relationship Modeling

CAP employs proven basics of Entity-Relationship Modeling for capturing the conceptual data structures of a given domain. Relationships are modeled as [Associations](../cds/cdl#associations) and [Compositions](../cds/cdl#compositions). {.indent}


#### CAP == Aspect-Oriented Programming {#aop}

[Aspects](../cds/cdl#aspects) in [CDS](../cds/) are borrowed from AOP, especially _Mixins_. With that, CAP greatly facilitates separation of concerns by "...factoring out technical concerns (such as security, transaction management, logging) from a domain model, and as such makes it easier to design and implement domain models that focus purely on the business logic." (source: [Wikipedia](https://en.wikipedia.org/wiki/Domain-driven_design#Relationship_to_other_ideas)) {.indent}


#### CAP == Functional Programming {#functional-programming}

Similar to Functional Programming, CAP promotes a declarative programming paradigm, which declaratively captures domain knowledge and intent (what), instead of writing imperative boilerplate code (how), as much as possible. This helps to automate many recurring tasks using best practices. Also similar to functional programming, and in contrast to object-oriented and object-relational approaches, CAP promotes the distinction of passive data (~immutable data) and active, stateless services (~pure functions). {.indent}

In addition, CAP features _queries as first-class and higher-order objects_, allowing us to apply late evaluation and materialization, similar to first-class and higher-order functions in Functional Programming. {.indent}


#### CAP != Object-Relational Mapping {#orm}

CAP and CDS aren't _Object-Relational Mapping_ (ORM). Instead, **we prefer querying** using [CQL](../cds/cql) to read and write data, which allows declaratively expressing which data you're interested in by means of projection and selection instead of loading object graphs automatically. Result sets are pure REST data, that are snapshot data representations. One reason for this is the assumption that the lifetime of object cache entries (which are essential for ORMs to perform) is frequently in the range of milliseconds for _REST_ services. {.indent}

#### CAP != Business Objects

Business Object Patterns promote the notion of active objects, which provide instance methods to modify their internal state. In contrast to that, CAP promotes a strict separation of passive data, read and exchanged in RESTful ways, and pure, stateless services. (→ see also the relationship to Functional Programming above). {.indent}



## About Capire

"*Capire*" (Italian for 'understand') is the name of our CAP documentation you're looking at right now. It's organized as follows:

- [*About CAP*](../about/) — a brief introduction and overview of key concepts
- [*Getting Started*](../get-started/jumpstart) — a few guides to get you started quickly
- [*Cookbook*](../guides/) — task-oriented guides from an app developer's point of view
- [*Tools*](../tools/) — choose your preferred tools
- *Reference docs* → for [*CDS*](../cds/), [*Node.js*](../node.js/), [*Java*](../java/)
- [*Releases*](../releases/) — information about what is new and what has changed
- [*Resources*](../resources/) — links to other sources of information

**TL;DR** — too long; didn't read — is a common social phenomenon these days. Therefore, capire is rather meagre with text and greased with code. You have to read between the lines, sorry.






## Glossary



- [**CAP**]() — Colloquial shorthand for "SAP Cloud Application Programming Model".
Not an official product name, though.

- [**CDS**](../cds/) — Core Data and Services
  : a family of languages, tools and libraries to declare, process and consume conceptual, semantically enriched data models.

- [**CDL**](../cds/cdl) — CDS Definition Language
  : a human-readable representation of CDS models.

- [**CSN**](../cds/csn) — Core Schema Notation
  : a plain (JavaScript) object-based representation of CDS models.
  (pronounce like _'Ceason'_)

- [**CQL**](../cds/cql) — CDS Query Language
  : an extension of SQL leveraging Associations defined in CDS models.
  (pronounce like _'Cequel'_)

- [**CQN**](../cds/cqn) — Core Query Notation
  : a plain (JavaScript) object-based representation to capture queries.
  (also contained in [CSN](../cds/csn))

- [**CXN**](../cds/cxn) — Core Expression Notation
  : a plain (JavaScript) object-based representation to capture expressions.
  (also contained in [CQN](../cds/cqn))


#### Badges

- <Since version="1.2.3" of="@sap/..." /> — The marked feature is only available with the given version or higher.

- <Alpha /> — Alpha features are experimental. They may never be generally available. If released subsequently, the APIs and behavior might change.

- <Beta /> — Beta features are planned to be generally available in subsequent releases, however, APIs and their behavior are not final and may change in the general release.

- <Concept /> — Concept features are ideas for potential future enhancements and an opportunity for you to give feedback. This is not a commitment to implement the feature though.

<span id="badges-more" />
