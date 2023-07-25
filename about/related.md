---
embed: link
status: released
---

# Related Concepts

The sections below provide additional information about CAP in the context of, and in comparison to, these related concepts:

#### CAP == _Hexagonal Architecture_ {#hexagonal-architecture}

CAP's service architecture is designed with the same ideas in mind as the blueprints of _Hexagonal Architecture_ (or Onion Architecture, or Clean Architecture). With that, CAP facilitates projects that choose to apply the principles and designs of those architecture patterns.


#### CAP promotes Domain-Driven Design {#domain-driven-design}

CAP greatly supports domain-driven design (DDD) by placing the primary focus on the problem domain, providing CDS as a powerful language to capture domain models and thereby facilitating close collaboration between domain experts and developers. CAP's core concepts fit well to the DDD counterparts of _Entities_, _Value Objects_, _Services_, and _Events_.

In contrast to DDD however, CAP prefers a strong distinction of active services and passive data; for example, there's no such thing as instance methods of entities in CAP. CAP also stays at a more axiomatic level of key concepts: the DDD concepts of _Repositories_, _Aggregates_, and _Factories_ intentionally don't have first-class counterparts in CAP, but can be realized using CAP's core concepts.


#### CAP promotes CQRS {#cqrs}

Similar to CQRS, CAP strongly recommends separating write APIs from read APIs by [defining separate, single-purposed services](../guides/providing-services#single-purposed-services). CDS's reflexive view building eases the task of declaring derived APIs exposing use case-specific de-normalized views on underlying domain models. Service actions in CAP can be used to represent pure commands. There’s no restriction to 'verb-only' dogmas in CAP though, as CAP focuses on business applications, which are mostly data-oriented by nature, hence frequently 'entity/noun-centric'.


#### CAP and Event Sourcing {#event-sourcing}

CAP can be combined with event sourcing patterns, that is, by tracking events in an event store, like Apache Kafka, instead of maintaining a snapshot of data in a relational or NoSQL database. Currently we don't provide out-of-the-box integration to such event sources (we may do so in near future), however this can be easily done in projects by respective service implementations using CAP's built-in capabilities to send and receive messages.

#### CAP supports SQL {#sql}

CDS borrows reflexive view building from SQL to declare derived models and APIs as projections/transformation of underlying models, such as domain models. [CQL](../cds/cql) is based on SQL DML to allow direct mapping to SQL databases. However, it extends SQL with [Associations](../cds/cdl#associations), [Path Expressions](../cds/cql#path-expressions), and [Nested Projections](../cds/cql#postfix-projections) to overcome the need to deal with JOINs. Instead, these extensions allow working with data in a structured document-oriented way.


#### CAP supports NoSQL {#nosql}

The previously mentioned extensions in [CQL](../cds/cql) feature the modeling of nested document structures as well as view building and querying using navigation instead of cross products, joins, and unions. This actually brings CDS close to the concepts of NoSQL databases, with the data models playing the role of schemas for validation. Although CAP currently doesn’t provide out-of-the-box support for concrete NoSQL databases, it’s easy to do so in project-specific solutions.


#### CAP and the Relational Model {#relational-model}

While CDS extends SQL and the relational model by means to describe, read, and write deeply nested document structures (see relationship to SQL below), it stays compatible to the principles of relational models with a specified mapping to relational databases.


#### CAP == Entity-Relationship Modeling

CAP employs proven basics of Entity-Relationship Modeling for capturing the conceptual data structures of a given domain. Relationships are modeled as [Associations](../cds/cdl#associations) and [Compositions](../cds/cdl#compositions).


#### CAP == Aspect-Oriented Programming {#aop}

[Aspects](../cds/cdl#aspects) in [CDS](../cds/) are borrowed from AOP, especially _Mixins_. With that, CAP greatly facilitates separation of concerns by "...factoring out technical concerns (such as security, transaction management, logging) from a domain model, and as such makes it easier to design and implement domain models that focus purely on the business logic." (source: [Wikipedia](https://en.wikipedia.org/wiki/Domain-driven_design#Relationship_to_other_ideas))


#### CAP == Functional Programming {#functional-programming}

Similar to Functional Programming, CAP promotes a declarative programming paradigm, which declaratively captures domain knowledge and intent (what), instead of writing imperative boilerplate code (how), as much as possible. This helps to automate many recurring tasks using best practices. Also similar to functional programming, and in contrast to object-oriented and object-relational approaches, CAP promotes the distinction of passive data (~immutable data) and active, stateless services (~pure functions).

In addition, CAP features _queries as first-class and higher-order objects_, allowing us to apply late evaluation and materialization, similar to first-class and higher-order functions in Functional Programming.


#### CAP != Object-Relational Mapping {#orm}

CAP and CDS aren’t _Object-Relational Mapping_ (ORM). Instead, **we prefer querying** using [CQL](../cds/cql) to read and write data, which allows declaratively expressing which data you’re interested in by means of projection and selection instead of loading object graphs automatically. Result sets are pure REST data, that are snapshot data representations. One reason for this is the assumption that the lifetime of object cache entries (which are essential for ORMs to perform) is frequently in the range of milliseconds for _REST_ services.

#### CAP != Business Objects

Business Object Patterns promote the notion of active objects, which provide instance methods to modify their internal state. In contrast to that, CAP promotes a strict separation of passive data, read and exchanged in RESTful ways, and pure, stateless services. (→ see also the relationship to Functional Programming above).
