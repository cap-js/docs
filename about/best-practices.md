---
status: released
---

# Best Practices by CAP

Key Concepts & Qualities
{.subtitle}

[[toc]] <!-- @include: ../links.md -->




## Introduction

### Primary Building Blocks

The CAP framework features a mix of proven and broadly adopted open-source and SAP technologies. The figure below depicts CAP's place and focus in a stack architecture.

![Vertically CAP services are placed between database and UI. Horizontally, CDS fuels CAP services and is closer to the core than, for example, toolkits and IDEs. Also shown horizontally is the integration into various platform services.](assets/architecture.drawio.svg){style="width:555px"}

The major building blocks are as follows:

- [**Core Data Services** (CDS)](/cds/) — CAP's universal modeling language, and the very backbone of everything; used to capture domain knowledge, generating database schemas, translating to and from various API languages, and most important: fueling generic runtimes to automatically serve request out of the box.

- [**Service Runtimes**](/guides/providing-services.md) for [Node.js](/node.js/) and [Java](/java/) — providing the core frameworks for services, generic providers to serve requests automatically, database support for SAP HANA, SQLite, and PostgreSQL, and protocol adaptors for REST, OData, GraphQL, ...

- [**Platform Integrations**](/plugins/) — providing CAP-level service interfaces (*'[Calesi]()'*) to cloud platform services in platform-agnostic ways, as much as possible. Some of these are provided out of the box, others as plugins.

- [**Command Line Interface** (CLI)](/tools/) — the swiss army knife on the tools and development kit front, complemented by integrations and support in [*SAP Build Code*](), *Visual Studio Code*, *IntelliJ*, and *Eclipse*.

In addition, there is a fast-growing number of [plugins] contributed by open-source and inner-source [communities](/resources/#public-resources) that enhance CAP in various ways, and integrate with additional tools and environments; the [*Calesi* plugins]() are among them.



### Models fuel Runtimes

CDS models play a prevalent role in CAP applications. They are ultimately used to fuel generic runtimes to automatically serve requests, without any coding for custom implementations required.

![Models fuel Generic Services](assets/fueling-services.drawio.svg){style="width:444px"}

CAP runtimes bootstrap *[Generic Service Providers]()* for services defined in service models. They use the information at runtime to translate incoming requests from a querying protocols, such as OData, into SQL queries sent to the database.

:::tip Models fuel Runtimes
CAP uses the captured declarative information about data and services to **automatically serve requests**, including complex deep queries, with expands, where clauses and order by, aggregations, and so forth...
:::




### Concepts Overview

Following sections provide an overview of the core concepts and design principles of CAP. The illustration below is an attempt to show all concepts, how they relate to each other, and to introduce the terminology.

![Service models declare service interfaces, events, facades, and services. Service interfaces are published as APIs and are consumed by clients. Clients send requests which trigger events. Services are implemented in service providers, react on events, and act as facades. Facades are inferred to service interfaces and are views on domain models. Service providers are implemented through event handlers which handle events. Also, service providers read/write data which has been declared in domain models.](assets/key-concepts.drawio.svg){style="padding-right:50px"}

Start reading the diagram from the _Service Models_ bubble in the middle, then follow the arrows to the other concepts.
We'll dive into each of these concepts in the following sections below, starting with _Domain Models_, the other grey bubble above...



## Domain Models

[CDS](/cds/) is CAP's universal modeling language to declaratively capture knowledge about an application's domain. Data models capture the *static* aspects of a domain, using the widely used technique of [*entity-relationship modelling*](). For example, a simple domain model as illustrated in this ER diagram:

![bookshop-erm.drawio](assets/bookshop-erm.drawio.svg)

In a first iteration, it would look like this in CDS, with some fields added:

::: code-group

```cds [Domain Data Model]
using { Country, cuid, managed } from '@sap/cds/common';

entity Books : cuid, managed {
  title  : localized String;
  author : Association to Authors;
}

entity Authors : cuid, managed {
  name    : String;
  books   : Association to many Books on books.author = $self;
  country : Country;
}
```

:::

[Type `Country` is declared to be an association to `sap.common.Countries`.](/cds/common#type-country) {.learn-more}


### Definition Language (CDL)

We use CDS's [*Conceptual Definition Language (CDL)*](/cds/cdl) as a *human-readable* way to express CDS models. Think of it as a *concise*, and more *expressive* derivate of [SQL DDL](https://wikipedia.org/wiki/Data_definition_language).

For processing at runtime CDS models are compiled into a *machine-readable* plain object notation, called *CSN*, which stands for [*Core Schema Notation (CSN)*](/cds/csn). For deployment to databases, CSN models are translated into native SQL DDL. Supported databases are *[SQLite]* and *[H2]* for development, and *[SAP HANA]* and *[PostgreSQL]* for production.

![cdl-csn.drawio](assets/cdl-csn.drawio.svg)

See also *[On the Nature of Models](/cds/models)* in the CDS reference docs. {.learn-more}



### Associations

Approached from an SQL angle, CDS adds the concepts of (managed) *[Associations](../cds/cdl#associations)*, and [path expressions](../cds/cql#path-expressions) linked to that, which greatly increases expressiveness of domain data models. For example, we can write queries, and hence declare views like that:

```cds [Using Associations]
entity EnglishBooks as select from Books
where author.country.code = 'GB';
```

This is an even more compact version, using *[infix filters](../cds/cql#with-infix-filters)* and [*navigation*]():

```cds
entity EnglishBooks as select from Authors[country.code='GB']:books;
```

::: details See how that would look like in SQL...

From a plain SQL perspective, think of *Associations* as the like of 'forward-declared joins', as becomes apparent in the following SQL equivalents of the above view definitions.

Path expression in `where` clauses become *INNER JOINs*:

```sql
CREATE VIEW EnglishBooks AS SELECT * FROM Books
-- for Association Books:author:
INNER JOIN Authors as author ON author.ID = Books.author_ID
-- for Association Authors:country:
INNER JOIN Countries as country ON country.code = author.country_code
-- the actual filter condition:
WHERE country.code = 'GB';
```
Path expression in *infix filters*  become *SEMI JOINs*, e.g.using `IN`:
```sql
CREATE VIEW EnglishBooks AS SELECT * FROM Books
-- for Association Books:author:
WHERE Books.author_ID IN (SELECT ID from Authors as author
  -- for Association Authors:country:
  WHERE author.country_code IN (SELECT code from Countries as country
    -- the actual filter condition:
    WHERE country.code = 'GB';
  )
)
```

... same with `EXISTS`, which is faster with some databases:

```sql
CREATE VIEW EnglishBooks AS SELECT * FROM Books
-- for Association Books:author:
WHERE EXISTS (SELECT 1 from Authors as author WHERE author.ID = Books.author_ID
  -- for Association Authors:country:
  AND EXISTS (SELECT 1 from Countries as country WHERE country.code = author.country_code
    -- the actual filter condition:
    AND country.code = 'GB';
  )
)
```

:::



### Aspects

A distinctive feature of CDS is its intrinsic support for [_Aspect-oriented Modelling_](../cds/aspects), which allows to factor out separate concerns into separate files. It also allows everyone to adapt and extend everything anytime, including reuse definitions you don't own, but have imported to your models.

::: code-group
```cds [Separation of Concerns]
// All authorization rules go in here, the domain models are kept clean
using { Books } from './my/clean/schema.cds';
annotate Books with @restrict: [{ grant:'WRITE', to:'admin' }];
```
```cds [Verticalization]
// Everyone can extend any definitions, also ones they don't own:
using { sap.common.Countries } from '@sap/cds/common';
extend Countries with { county: String } // for UK, ...
```
```cds [Customization]
// SaaS customers can do the same for their private usage:
using { Books } from '@capire/bookshop';
extend Books with { ISBN: String }
```
:::

<br/>

:::tip Key features & qualities
CDS greatly promotes [***Focus on Domain***]() by a *concise* and *comprehensible* language. Intrinsic support for *[aspect-oriented modeling]()* fosters *[**Separation of Concerns**]()*, as well as *[**Extensibility**]()* in [customization](), [verticalization](), and [composition]() scenarios.
:::





## Services

Services are the most central concept in CAP when it comes to an application's behavior. They are  declared in CDS, frequently as views on underlying data, and implemented by services providers in the CAP runtimes. This ultimately establishes a **Service-centric Paradigm** which manifests in these **key design principles**:

- **Every** active thing is a **service** → _yours, and framework-provided ones_{.grey}
- Services establish **interfaces** → *declared in service models*{.grey}
- Services react to **events** → *in sync and async ones*{.grey}
- Services run **queries** → *pushed down to database*{.grey}
- Services are **agnostic** → *platforms and protocols*{.grey}
- Services are **stateless** → *process passive data*{.grey}

![Key Design Principles](assets/paradigm.drawio.svg)

:::tip Design principles and benefits
The design principles - and adherence to them - are crucial for the key features & benefits.
:::

### Services as Interfaces

Service models capture the *behavioral* aspects of an application. In its simplest form a service definition focusing on the *interface* only could look like that:

::: code-group

```cds [Service Definition in CDS]
service BookshopService {
  entity Books : cuid { title: String; author: Association to Authors }
  entity Authors :cuid { name: String; }
  action submitOrder ( book: UUID, quantity: Integer );
}
```

:::

### Services as Facades

Most frequently, services expose denormalized views of underlying domain models. They act as facades to an application's core domain data. The service interface results from the _inferred_ element structures of the given projections.

For example, if we take the [*bookshop* domain model](/get-started/in-a-nutshell#capture-domain-models) as a basis, we could define a service that exposes a flattened view on books with authors names as follows (note and click on the *⇒ Inferred Interface* tab):

::: code-group

```cds [Service as Facade]
using { sap.capire.bookshop as underlying } from '../db/schema';
service CatalogService {
  @readonly entity ListOfBooks as projection on underlying.Books {
    ID, title, author.name as author // flattened
  }
}
```

```cds [⇒ &nbsp; Inferred Interface]
service CatalogService {
  @readonly entity ListOfBooks {
    key ID : UUID;
    title  : String;
    author : String, // flattened authors.name
  }
}
```

[Learn more about `as projection on` in the **Querying** section below](#querying). {.learn-more}

:::

::: tip **Single-purposed Services**
The previous example follows the recommended best practice of a *[single-purposed service](/guides/providing-services#single-purposed-services)* which is specialized on *one* specific use case and group of users. Learn more about that in the [Providing Services](/guides/providing-services) guide.
:::

### Service Providers

As we'll learn in the next chapter below, service providers, that is the implementations of services, react to events, such as a request from a client, by registering respective event handlers. At the end of the day, a service implementation is **the sum of all event handlers** registered with this service.



### CAP Services != µ-services

Don't confuse CAP services with Microservices:

- **CAP services** are modular software somponents, while ...
- **Microservices** are deployment units.

CAP services are important for how you *design* and *implement* your applications in clean and modularized ways on a fine-granular use case-oriented level. The primary focus of Microservices is on how to cut your whole application into independent coarse-grained(!) deployment units, in order to release and scale them independently.

[Learn more about that in the the [Anti Patterns secttion on Microservices](bad-practices#microservices-mania)] {.learn-more}

## Events

While services are the most important concept across models and runtime, events are equally, if not more, important to the runtime. CAP has a *ubiquitous* notion of events: they show up everywhere, and everything is an event, and everything happening at runtime is in reaction to events.
This manifests in these additional **design principles**, complementing our [*Service-centric Paradigm*](#services):

- **Everything** happening at runtime is triggered by / in reaction to **events**
- **Providers** subscribe to, and *handle* events, as their implementations
- **Observers** subscribe to, and *listen* to events 'from the outside'
- Events can be of ***local*** or ***remote*** origin, and be...
- Delivered via ***synchronous*** or ***asynchronous*** channels



### Event Handlers

Services react to events by registering *event handlers*. This is an example of that in Node.js:

```js
class BookshopService extends cds.ApplicationService { init() {
  const { Books } = this.entities
  this.before ('UPDATE', Books, req => validate (req.data))
  this.after ('READ', Books, books => ... )
  this.on ('SubmitOrder', req => this.emit ('BookOrdered',req.data))
}}
```

You can also register *generic* handlers, acting on classes of similar events:

```js
this.before ('READ','*', ...)   // for READ requests to all entities
this.before ('*','Books', ...)  // for all requests to Books
this.before ('*', ...)          // for all requests served by this srv
```

::: info What constitutes a service implementation?
The service's implementation consists of all event handlers registered with it.
:::



### Event Listeners

The way we register event handlers that *implement* a service looks very similar to how we would register similar handlers for the purpose of just *listening* to what happens with other services. At the end of the day, the difference is only to *whom* we register event listeners.

::: code-group

```js [Service Provider]
class SomeServiceProvider { async init() {
  this.on ('SomeEvent', req => { ... })
}}
```

```js [Observer]
class Observer { async init() {
  const that = await cds.connect.to ('SomeService')
  that.on ('SomeEvent', req => { ... })
}}
```

:::

::: info Service provider and observer
Everyone/everything can register event handlers with a given service. This is not limited to the service itself, as its implementation, but also includes *observers* or *interceptors* listening to events 'from the outside'.
:::

::: details Including framework-provided services ...

These usages even look the same for application services and framework-provided ones, like CAP's [*database services*]() or [*messaging services*](). That is, we send queries to database services in the very same way as we do with local CAP services that support [querying](), or with remote [*OData*]() or [*GraphQL*]() services.

<!-- All those links depend on the runtime, right? -->

:::



### Sync / Async

From an event handler's perspective, there's close to no difference between *synchronous requests* received from client like UIs, and *asynchronous event messages* coming in from respective message queues. The arrival of both, or either of which, at the service's interface is an event, to which we can subscribe to and react in the same uniform way, thus blurring the lines between the synchronous and the asynchronous world.

![events.drawio](assets/events.drawio.svg){style="padding-right:123px"}

Handling synchronous requests vs asynchronous event messages:

::: code-group

```js [Handling sync Requests]
class CatalogService { async init() {
  this.on ('SubmitOrder', req => {        // sync action request
    const { book, quantity } = msg.data  // process it...
  })
}}
```

```js [Handling async Events]
class AnotherService { async init() {
  const cats = await cds.connect.to ('CatalogService')
  cats.on ('BookOrdered', msg => {        // async event message
    const { book, quantity } = msg.data  // process it...
  })
}}
```

:::

Same applies to whether we *send* a request or *emit* an asynchronous event:

```js
await cats.send ('SubmitOrder', { book:201, quantity:1 })
await this.emit ('BookOrdered', { book:201, quantity:1 })
```



### Local / Remote

Services can not only be used and called remotely, but also locally, within the same process. The way we connect to and interact with *local* services is the same as for *remote* ones, via whatever protocol:

```js
const local_or_remote = await cds.connect.to('SomeService')
await local_or_remote.send ('SomeRequest', {...data})
await local_or_remote.read ('SomeEntity').where({ID:4711})
```

Same applies to the way we subscribe to and react to incoming events:

```js
this.on ('SomeRequest', req => {/* process req.data */})
this.on ('READ','SomeEntity', req => {/* process req.query */})
```

> [!note]
>
> The way we *connect* to and *consume* services, as well as the way we *listen* and *react* to events, and hence *implement* services, are *agnostic* to whether we deal with *local* or *remote* services, as well as to whatever *protocols* are used. <br/>→ see also [*Agnostic by Design*](#agnostic-by-design)



## Data

All data processed and served by CAP services is *passive*, and representated by *plain simple* data structures as much as possible. In Node.js it's plain JavaScript record objects, in Java it's hash maps.  This is of utmost importance for the reasons set out in the following sections.

![passive-data.drawio](assets/passive-data.drawio.svg)

### Extensible Data

Extensibility, in particular in a SaaS context, allows customers to tailor an SaaS application to their needs by adding extension fields. This fields are not known at design time but need to be served by your services, potentially through all interfaces. CAP's combination of dynamic querying and passive data this is intrinsically covered and extension fields look and feel no different than pre-defined fields.

For example, an extension like that can automatically be served by CAP:

```cds
extend Books with {
   some_extension_field : String;
}
```

> [!warning]
>
> In contrast to that, common *DAOs*, *DTOs*, *Repositories*, or *Active Records* approaches which use static classes can't transport such extension data, not known at the time these classes are defined. Additional means would be required, which is not the case for CAP.

### Queried Data

As detailed out in the next chaper, querying allows service clients to exactly ask for the data they need, instead of always reading full data records, only to display a list of books titles. For example, querying allows that:

```js
let books = await GET `Books { ID, title, author.name as author }`
```

While a static DAO/DTO-based approach would look like that:

```js
let books = await GET `Books` // always read in a SELECT * fashion
```

In effect, with querying the shape of records in result sets vary very much, even in denormalized ways, which is hardly possible to achieve with static access or transfer objects.

### Passive Data

As, for the aforementioned reasons, we can't use static classes to represent data at runtime, there is also no reasonable way to add any behavior to data objects. So in consequence, all data has to be passive, and hence all logic, such as for validation or field control 'determinations' has to go somewhere else → into event handlers.

> [!tip]
>
> Adhering to the principle of passive data, also has other positive effects. For example:
>
> **(1)** Passive data can be easily cached in content delivery networks. &nbsp; **(2)** Passive data is more lightweight than active objects. &nbsp; **(3)** Passive data is *immutable* → which allows to apply parallelization as known from functional programming.



## Querying

As a matter of fact, business applications tend to be *data-centric*. That is, the majority of operations deal with the discipline of reading and writing data in various ways. Over the decades, querying, as known from SQL, as well as from web protocols like OData or GraphQL, became the prevalent and most successful way for this discipline.

### Query Language (CQL)

As already introduced in the [*Domain Models*](#domain-models) section, CAP uses queries in CDS models, for example to declare service interfaces by projections on underlying entities, here's an excerpt of the above:

```cds
entity ListOfBooks as projection on underlying.Books {
  ID, title, author.name as author
}
```

We use [CDS's *Conceptual Query Language (CQL)*](/cds/cql) to write queries in a human-readable way. For reasons of familiarity, CQL is designed as a derivate of SQL, but used in CAP independent of SQL and databases. For example to derive new types as projections on others, or sending OData or GraphQL queries to remote services.

Here's a rough comparison of [CQL] with [GraphQL], [OData], and [SQL]:

<span class="centered">

| Feature            |   CQL   |  GraphQL  |  OData  |   SQL   |
| ------------------ | :-----: | :-------: | :-----: | :-----: |
| CRUD               | &check; |  &check;  | &check; | &check; |
| Flat Projections   | &check; |  &check;  | &check; | &check; |
| Nested Projections | &check; |  &check;  | &check; |         |
| Navigation         | &check; | (&check;) | &check; |         |
| Filtering          | &check; |           | &check; | &check; |
| Sorting            | &check; |           | &check; | &check; |
| Pagination         | &check; |           | &check; | &check; |
| Aggregation        | &check; |           | &check; | &check; |
| Denormalization    | &check; |           |         | &check; |
| Native SQL         | &check; |           |         | &check; |

</span>

As apparent from this comparison, we can regard CQL as a superset of the other query languages, which enables us to translate from and to all of them.

### Queries at Runtime

CAP also uses queries at runtime: an OData or GraphQL request is essentially a query which arrives at a service interface. Respective protocol adapter translate these into *machine-readable* runtime representations of CAP queries (→ see [*Core Query Notation, CQN*](/cds/cqn)), which are then forwarded to and processed by target services. Here's an example, including CQL over http:

::: code-group

```sql [CQL]
SELECT from Books { ID, title, author { name }}
```

```graphql [CQL /http]
GET Books { ID, title, author { name }}
```
```graphql [GraphQL]
POST query {
  Books {
    ID, title, author {
      name
    }
  }
}
```
```http [OData]
GET Books?$select=ID,title&$expand=author($select=name)
```
```js [⇒  CAP Query (in CQN)]
{ SELECT: { from: {ref:['Books']},
    columns: [ 'ID', 'title', {ref:['author']},
      expand:[ 'name' ]
    }]
}}
```

:::

Queries can also be created programmatically at runtime, for example to send queries to a database. For that we're using *human-readable* language bindings, which in turn create CQN objects behind the scenes. For example, like that in Node.js (both creating the same CQN object as above):

::: code-group

```js [Using TTL]
let books = await SELECT `from Books {
  ID, title, author { name }
}`
```

```js [Using Fluent API]
let books = await SELECT.from (Books, b => {
  b.ID, b.title, b.author (a => a.name)
})
```

:::

### Push-Down to Databases

The CAP runtimes automatically translate incomming queries from the protocol-specific query language to CQN and then to native SQL, which is finally sent to underlying databases. The idea is to push down queries to where the data is, and be executed there with best query optimization and late materialization.

![cql-cqn.drawio](assets/cql-cqn.drawio.svg)

CAP queries are **first-class** objects with **late materialization**. They are captured in CQN, kept in standard program variables, passed along as method arguments, are transformed and combined with other queries, translated to other target query languages, and finally sent to their targets for execution. This process is similar to the role of functions as first-class objects in functional programming languages.

## Agnostic by Design

In the above introductions to CAP's core concepts we learned already that your domain models, as well as the services and their implementations in event handlers are agnostic to local vs remote, to protocols, as well as to databases, which is complemented by CAP-level Service Integrations (→ see *[The 'Calesi' Effect](#the-calesi-effect)*) by asbtractions from (low-level) interfaces to platform services and technologies. So, in total, and in effect:

> [!tip] Your domain models and application logic stays...
>
> - [Agnostic to *Databases*]()
> - [Agnostic to *Protocols*]()
> - [Agnostic to *Local vs Remote*]()
> - [Agnostic to *Platform Services* and low-level *Technologies*]()

This thoroughly agnostic design is the key enabling quality for several of the major benefits and value propositions offered by CAP, as highlighted in the following sub sections...



### ⇒ Hexagonal Architecture {#hexagonal}

The *[Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)* (aka *Ports and Adapters Architecture/Pattern*) as first proposed by Alistair Cockburn in 2005, is quite famous and fancied these days (rightly so). As Cockburn introduces it, its intent is to:

*"Allow an application to equally be driven by users, programs, automated test or batch scripts, and to be developed and tested in isolation from its eventual run-time devices and databases"* {.indent style="font-family:serif"}

#### The Origins — Bits of History

Before looking into how that relates to CAP, or rather vice versa, it's probably helpful to understand that Hexagonal Architecture is not in contrast to related software architecture models, but an evolution of those, in particular of *Model View Controller*, as invented by Trygve Reenskaug et al. in Smalltalk-80 at Xerox PARC, and *Layered Architectures*, as promoted by Kyle Brown, Andrew Tannenbaum and Edgser W. Dijkstra (couldn't resist listing the names of these giants, and idols of my youth, sorry \;-).

Let's do a quick time travel by a rough summary of the respective entries in the "*Portland Patterns Repository*" in [C2 wiki](https://wiki.c2.com) (the world's first ever wiki by Ward Cunningham; again \;):

- The [*Model View Controller (MVC)*](https://wiki.c2.com/?ModelViewController) pattern "makes domain logic independent from UI widgetry", thereby promoting reuse of the domain model code.
   ::: details
    *Views* + *Controllers* are the widgetry; *Models* are the UI-independent code parts.
   Note: The term '*Model*' as used in MVC doesn't mean no-code → code is percieved as a *model of the real world* in here.
   :::

- The [*Four Layers Architecture*](https://wiki.c2.com/?FourLayerArchitecture), took the fundamental intent and designs from MVC, and applied it to a layered architecture, which commonly had three layers, but he split the *Logic* layer into an *Application Model* on top of a *Domain Model*.
   ::: details Application Models vs Domain Models ...

   The original implementations in [Smalltalk-80](https://en.wikipedia.org/wiki/Smalltalk) already had *Application Model* classes showing up on top of the (real) *Domain Model* classes: Basically, the former encapsulate the application's business logic, while the latter encapsulate the application's data objects, with only the most central invariants carved in stone.

   ( Note that the original MVC wasn't designed for layered architectures, but was always presented as a "*Triade*" ).

   :::

- The [*Hexagonal Architecture*](https://wiki.c2.com/?HexagonalArchitecture) basically evolved the ideas of the former into a symetric shape (as Cockburn is "a symmetrist at heart"), thereby unifying the *View* layer on top and the *Infrastructure* layer at the bottom into *Transformers* living in an outer hexagon, while the *Application Model*, and the *Domain Model* live in an inner hexagon. He originally depicted that as follows in plain text:

   ```http
   OUTSIDE <-> transformer <--> ( application  <->  domain )
   ```

   ::: details Transformers → Adapters

   Cockburn later on renamed his original proposal to [*Ports and Adapters Architecture*](https://wiki.c2.com/?PortsAndAdaptersArchitecture), and in there replaced his initial choice of the term "*Transformers*" with "*Adapters*" / "*Adaptors*".
   :::

#### See Also...

- [*Hexagonal Architecture and DDD (Domain Driven Design)* by Sven Woltmann](https://www.happycoders.eu/software-craftsmanship/hexagonal-architecture/#hexagonal-architecture-and-ddd-domain-driven-design), which probably has the best, and most correct illustrations, like this one:

![Hexagonal architecture and DDD (domain driven design)](https://www.happycoders.eu/wp-content/uploads/2023/01/hexagonal-architecture-ddd-domain-driven-design-600x484.png){.zoom75}

- [*Ports and Adapters* by Damon Kelly](https://8thlight.com/insights/a-color-coded-guide-to-ports-and-adapters)
- [*Hexagonal Architecture* on Wikipedia](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software))

#### Hexagonal Architecture by CAP

CAP's [agnostic design principles](#agnostic-by-design) are very much in line with the goals of Hexagonal Architecture, and actually give you exactly what these are aiming for: as your applications greatly stay *agnostic* to protocols, and other low-level details, which could lock them in to one specific execution environment, they can be "*developed and tested in isolation*", which in fact is one of CAP's [key guiding principles](#inner-loop) and [value propositions](../about/#rapid-development). Moreover, they become [*resilient* to disrupting changes](../about/#evolution-w-o-disruption) in "the outside".

Not only do we address the very same goals, we can also identify several symmetries in the way we address and achieve these goals as follows:

| Hexagonal Architecture | CAP                                                          |
| ---------------------- | ------------------------------------------------------------ |
| "The Outside"          | (Remote) Clients of Services, Databases, Platform Services   |
| Adapters               | Protocol Adapters (inbound + outbound), <br />Framework Services (outbound) |
| Ports                  | Agnostic Service Interfaces + Events (inbound + outbound)    |
| Application Model      | Agnostic Service Providers + Event Handlers                  |
| Domain Model           | Domain Model Entities (w/ essential invariants)              |

> [!tip]
>
> **Conclusion and Key Takeaway:** CAP is very much in line with both, the intent and goals of Hexagonal Architecture, as well as with the fundamental concepts. Actually, CAP is an implementation of Hexagonal Architecture, in particular with respect to the Adapters in the outer hexagon, but also re *Application Models* and *(Core) Domain Models* in the inner hexagon.

[Also take notice of the *Squared Hexagons* section in the Anti Patterns guide](bad-practices#squared-hexagons) {.learn-more}

### ⇒ Inner Loop Development {#inner-loop}

The database-agnostic design allows us to use in-memory SQLite or H2 databases at development time, as well as for level 1 functional tests, while using SAP HANA for production. This not only speeds up development turnaround times by magnitudes, it also minimises development costs in a similar scale.

### ⇒ Evolution w/o Disruption {#evolution}

### ⇒ Late-cut Microservices {#late-cut-mss}

This agnostic design allows [mocking remote services](/guides/using-services#local-mocking), as well as doing late changes to service topologies. For example, you can — and always should — start with co-located services in a single process, while being able to deploy them to separate micro services later on, when you know more about your app and how to scale which parts of it.
:::



## Intrinsic Cloud Qualities

- #### Multitenancy

- #### Extensibility

- #### Security

- #### Scalability

- #### Resilience



## Intrinsic Extensibility

#### Extending Models

> [!tip]
>
> **Nota bene:** not only can your SaaS customers extend *your* definitions, but also you can extend any definitions that you *reuse* to adapt it to your needs.

#### Extension Logic

#### Extensible Framework

As stated in the introduction: "*Every active thing is a Service*". This also applies to all framework features and services, like databases, messaging, remote proxies, MTX services, etc.

And as everybody can add event handlers to services, not only the service implementations, you can also add event handlers to framework services, and thereby extend the core framework.

For example, you could extend the database service like this:

```js
cds.db.before ('*', req => {
  console.log (req.event, req.target.name)
})
```





## The 'Calesi' Effect

Keeping pace with a rapidly changing world of cloud technologies and platforms is a major challenge when you hardwire too many things into today's technologies that might soon become obsolete. CAP avoids such lock-ins and shields application developers from low-evel things like:

- Low-level **Security**-related things like Certificates, mTLS, SAML, OAuth, OpenID, ...
- **Service Bindings** like K8s secrets, VCAP_SERVICES, ...
- **Multitenancy**-related things, especially w.r.t. tenant isolation
- **Messaging** protocols or brokers such as AMQP, MQTT, Webhooks, Kafka, Redis, ...
- **Remoting** protocols such as HTTP, gRCP, OData, GraphQL, SOAP, RFC, ...
- **Audit Loging** → use the *[Calesi]()* variant, which provides ultimate resilience
- **Logs**, **Traces**, **Metrics** → CAP does that behind the scenes + provides *[Calesi]()* variants
- **Transaction Management** → CAP manages all transactions → don't mess with that!

> [!tip]
>
> CAP not only abstracts these things at scale, but also does most things automatically in the background. In addition, it allows us to provide various implementations that encourage *[Evolution w/o Disruption]()*, as well as fully functional mocks used in development, enabling *[Inner Loop Development]()* and thus *[Fast Development at Minimized Costs]()*.

> [!warning]
>
> Of course, you can always ignore and bypass these abstractions. However, keep in mind that by doing so, you will be missing out on many of the benefits they offer. Additionally, there is a higher risk of accumulating *[Technical Debt]()*.

> [!caution]
>
> Things get really dangerous when application developers have to deal with low-level security-related things like authentication, certificates, tenant isolation, etc. Whenever this happens, it's a clear sign that something is seriously wrong.

## Related Art

The sections below provide additional information about CAP in the context of, and in comparison to, related concepts.

#### CAP == _Hexagonal Architecture_

CAP's service architecture is designed with the same ideas in mind as the blueprints of _Hexagonal Architecture_ (or Onion Architecture, or Clean Architecture). With that, CAP facilitates projects that choose to apply the principles and designs of those architecture patterns. {.indent}


#### CAP promotes Domain-Driven Design

CAP supports domain-driven design (DDD) by placing the primary focus on the problem domain. It provides CDS as a powerful language to capture domain models and thereby facilitates close collaboration between domain experts and developers. CAP's core concepts fit well to the DDD counterparts of _Entities_, _Value Objects_, _Services_, and _Events_. {.indent}

In contrast to DDD however, CAP prefers a strong distinction of active services and passive data; for example, there's no such thing as instance methods of entities in CAP. CAP also stays at a more axiomatic level of key concepts: the DDD concepts of _Repositories_, _Aggregates_, and _Factories_ intentionally don't have first-class counterparts in CAP, but can be realized using CAP's core concepts. {.indent}


#### CAP promotes CQRS

Similar to CQRS, CAP strongly recommends separating write APIs from read APIs by [defining separate, single-purposed services](/guides/providing-services#single-purposed-services). CDS's reflexive view building eases the task of declaring derived APIs exposing use case-specific de-normalized views on underlying domain models. Service actions in CAP can be used to represent pure commands. There's no restriction to 'verb-only' dogmas in CAP though, as CAP focuses on business applications, which are mostly data-oriented by nature, hence frequently 'entity/noun-centric'. {.indent}


#### CAP and Event Sourcing

CAP can be combined with event sourcing patterns, that is, by tracking events in an event store, like Apache Kafka, instead of maintaining a snapshot of data in a relational or NoSQL database. Currently we don't provide out-of-the-box integration to such event sources (we may do so in near future), however this can be easily done in projects by respective service implementations using CAP's built-in capabilities to send and receive messages. {.indent}

#### CAP supports SQL

CDS borrows reflexive view building from SQL to declare derived models and APIs as projections/transformation of underlying models, such as domain models. [CQL](/cds/cql) is based on SQL DML to allow direct mapping to SQL databases. However, it extends SQL with [Associations](/cds/cdl#associations), [Path Expressions](/cds/cql#path-expressions), and [Nested Projections](/cds/cql#nested-expands) to overcome the need to deal with JOINs. Instead, these extensions allow working with data in a structured document-oriented way. {.indent}


#### CAP supports NoSQL

The previously mentioned extensions in [CQL](/cds/cql) feature the modeling of nested document structures as well as view building and querying using navigation instead of cross products, joins, and unions. This actually brings CDS close to the concepts of NoSQL databases, with the data models playing the role of schemas for validation. Although CAP currently doesn't provide out-of-the-box support for concrete NoSQL databases, it's easy to do so in project-specific solutions. {.indent}


#### CAP and the Relational Model

While CDS extends SQL and the relational model by means to [describe, read, and write deeply nested document structures](#cap-supports-sql), it stays compatible to the principles of relational models with a specified mapping to relational databases. {.indent}


#### CAP == Entity-Relationship Modeling

CAP employs proven basics of Entity-Relationship Modeling for capturing the conceptual data structures of a given domain. Relationships are modeled as [Associations](/cds/cdl#associations) and [Compositions](/cds/cdl#compositions). {.indent}


#### CAP == Aspect-Oriented Programming

[Aspects](/cds/cdl#aspects) in [CDS](/cds/ are borrowed from AOP, especially _Mixins_. With that, CAP greatly facilitates separation of concerns by "...factoring out technical concerns (such as security, transaction management, logging) from a domain model, and as such makes it easier to design and implement domain models that focus purely on the business logic." (source: [Wikipedia](https://en.wikipedia.org/wiki/Domain-driven_design#Relationship_to_other_ideas)) {.indent}


#### CAP == Functional Programming

Similar to Functional Programming, CAP promotes a declarative programming paradigm, which declaratively captures domain knowledge and intent (what), instead of writing imperative boilerplate code (how), as much as possible. This helps to automate many recurring tasks using best practices. Also similar to functional programming, and in contrast to object-oriented and object-relational approaches, CAP promotes the distinction of passive data (~immutable data) and active, stateless services (~pure functions). {.indent}

In addition, CAP features _queries as first-class and higher-order objects_, allowing us to apply late evaluation and materialization, similar to first-class and higher-order functions in Functional Programming. {.indent}


#### CAP != Object-Relational Mapping

CAP and CDS aren't _Object-Relational Mapping_ (ORM). Instead, **we prefer querying** using [CQL](/cds/cql) to read and write data, which allows declaratively expressing which data you're interested in by means of projection and selection instead of loading object graphs automatically. Result sets are pure REST data, that are snapshot data representations. One reason for this is the assumption that the lifetime of object cache entries (which are essential for ORMs to perform) is frequently in the range of milliseconds for _REST_ services. {.indent}

#### CAP != Business Objects

Business Object Patterns promote the notion of active objects, which provide instance methods to modify their internal state. In contrast to that, CAP promotes a strict separation of passive data, read and exchanged in RESTful ways, and pure, stateless services, see also the [relationship to Functional Programming](#cap-functional-programming). {.indent}
