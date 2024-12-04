---
# status: released
---

# Bad Practices

[[toc]]



## Questionable Prior Arts

### DAOs, DTOs, Active Records, et al

### Object-Relational Mappers

### BO-centric Frameworks

... which bypass or are in conflict with CAP's [key design principles](bad-practices.md), for example:

- ORM techniques like Spring repositories
- Active Records, DAOs

These would be in conflict with CAP's focus on stateless services processing passive data, as well as with the querying-based approach to read and write data.

### Determinations & Validations

### Sticking to DIY, or NIH

Such as...

- Low-level http or OData requests
- Low-level integration with message brokers
- Database-specific things without need
- Non-CAP client libraries for BTP services

Doing so would spoil the party, for example regarding rapid local development at minimized costs, fast test pipelines, late-cut µ services.
It would also expose your projects to risks of disruptions by changes in those rather volatile technologies.

### Always done it this way

## Squared Hexagons

### Hexagonal Arch ** 2 = ?

CAP's design principles are very much in line with the approaches of [hexagonal architecture](https://en.wikipedia.org/wiki/Hexagonal_architecture) or [clean architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html), and actually give you exactly what hexagonal architecture is aiming for:

- domain logic stays agnostic to protocols and changing low-level technologies
- resilience to disrupting changes in those spaces

So, there's little need to homebrew your own hexagonal architecture on top of CAP, and high risks you miss CAP's advantages in this regard.

### Same for DDD...

...

### Abstracting from CAP



## Code Generators

### The Swagger Textbook

Alternative frameworks or toolsets follow code generation approaches. Swagger does so for example: One write OpenAPI documents in YAML in the [Swagger Editor](https://editor.swagger.io), and have a server package generated, for example for Node.js, which, as the included readme tells us *"... leverages the mega-awesome [swagger-tools](https://github.com/apigee-127/swagger-tools) middleware which does most all the work."* → it does so as follows:

<span class="centered">

| Feature                              |       Swagger        |          CAP          |
|--------------------------------------|:--------------------:|:---------------------:|
| Lines of code for service definition | **~555**{.h3}{.red}  | **~11**{.h3} {.green} |
| Lines of code for implementation     | **~500**{.h3} {.red} |  **0**{.h3} {.green}  |
| Size of framework library            |     16 MB {.red}     |    10 MB {.green}     |
| CRUDQ served on DB, including...     |                      |        &check;        |
| Deep Reads & Writes                  |                      |        &check;        |
| Deep Hierarchies                     |                      |        &check;        |
| Aggregations                         |                      |        &check;        |
| Pagination                           |                      |        &check;        |
| Sorting                              |                      |        &check;        |
| Search                               |                      |        &check;        |
| Filtering                            |                      |        &check;        |
| Primary Keys                         |                      |        &check;        |
| Access Control                       |                      |        &check;        |
| Localized Data                       |                      |        &check;        |
| Managed Data                         |                      |        &check;        |
| Media Data                           |                      |        &check;        |
| Temporal Data                        |                      |        &check;        |
| Fiori Draft Handling                 |                      |        &check;        |
| Exclusive Locking                    |                      |        &check;        |
| Conflict Detection (via ETags)       |                      |        &check;        |
| Data Replication (upcomming)         |                      |        &check;        |
| Data Privacy                         |                      |        &check;        |
| ...                                  |                      |        &check;        |

</span>

While code generators also have you writing less code yourself, the code is still there (to cover all that CAP covers, we could extrapolate the 500 lines of code to end up in ~5,000, maybe 50,000 ...?). To mention only the most critical consequence out of this: **No single points to fix**, as you simply can't fix code generated in the past.

::: details CDS-based service definitions vs OpenAPI documents ...

Even if we'd ignore all the other things, there still remains the difference between writing ~11 lines of concise and comprehensible CDS declarations, or ~333 lines of YAML. While the former allows to involve and closely collaborate with domain experts, the latter certainly doesn't. (And technocratic approaches like Hexagonal Architecture or Domain-Driven Design the way it's frequently done by developers don't really help either.)

:::

### Code-Generating AI

- → don't confuse "[Generative AI](https://en.wikipedia.org/wiki/Generative_artificial_intelligence)" with 'Code-generating AI'

## Overly Generic Approaches

### The 'ODatabase' Anti Pattern

### Overdesigned Architectures

### Tons of Glue Code



## Microservices Mania

- https://blog.payara.fish/microservices-mania-are-moduliths-the-saner-path-to-scalable-architecture
- https://www.f5.com/de_de/company/blog/mainstream-microservices-mania-challenges-increasing-with-adoption
- https://www.reddit.com/r/programming/comments/18crnmz/death_by_a_thousand_microservices/
- https://dzone.com/articles/architecture-style-modulith-vs-microservices
- https://medium.com/codex/what-is-better-modular-monolith-vs-microservices-994e1ec70994

### Premature Fragmentation {.avoid}

### Late-cut Microservices {.prefer}
