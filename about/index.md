---
status: released
---

# About CAP

Value Propositions {.subtitle}

[[toc]]



## What is CAP?

The _Cloud Application Programming Model_ (CAP) is a framework of languages, libraries, and tools for building *enterprise-grade* cloud applications. It guides developers along a *golden path* of proven [best practices](best-practices), served [out-of-the-box](#served-out-of-the-box), and hence greatly reduces boilerplate code and tedious recurring tasks.

In effect, CAP-based projects benefit from a primary [focus on domain](#focus-on-domain) in close collaboration with domain experts, and from [accelerated development](#grow-as-you-go) at minimised costs. CAP's *agnostic design* shields developers from overly technical disciplines, and fosters evolution w/o disruption in a world of rapidly changing technologies.



## Jumpstart & Grow As You Go...
###### grow-as-you-go

### Jumpstart Development

Following the principle of **convention over configuration**, there's no need to set up things upfront. CAP allows you to **jumpstart** projects within seconds and have a team starting development right away, using generic providers, on top of a lightweight in-memory database → see [*Getting Started in a Nutshell*](../get-started/in-a-nutshell).

### Fast Turnarounds

CAP also offers **mocks for many platform features**, which allow **fast dev-test-run cycles** with minimal development environment complexity — aka *Airplane Mode*. Similarly, CAP facilitates **integration scenarios** by importing an API from, for example, an SAP S/4HANA backend or from SAP Business Accelerator Hub and running mocks for this locally.

### Loose Coupling

Finally, projects are encouraged to **parallelize workloads**. For example, following a **contracts-first** approach, a service definition is all that is required to automatically run a full-fledged REST or OData service. So, projects could spawn two teams in parallel: one working on the frontend, while the other one works on the backend part. A third one could start setting up CI/CD and delivery in parallel.

### Minimized Costs

Over time, you **add things gradually**, only when they're needed. For example, you can move ahead to running your apps in close-to-productive setups for integration tests and delivery, without any change in models or code.

### Late-cut Microservices



## Proven Best Practices

### Cloud-Native by Design

CAP's [service-centric paradigm](best-practices#services) is designed from the ground up for cloud-scale enterprise applications. Its core design principles of flyweight, stateless services processing passive, immutable data, complemented by an intrinsic, ubiquitous [events-based](best-practices#events) processing model greatly promote scalability and resilience.

On top of that, serveral built-in facilities address a lot of things to care about in cloud-based apps out of the box, such as:

- **Multitenancy** → tenant *isolation* at runtime; *deploy*, *subscribe*, *update* handled by MTX
- **Extensibility** → for customers to tailor SaaS apps to theis needs →  [see below...](#intrinsic-extensibility)
- **Security** → CAP+plugins do authentications, certificates, mTLS, ...
- **Scalability** → by stateless services, passive data, messaging, ...
- **Resilience** → by messaging, tx outbox, outboxed audit logging, ...
- **Observability** → by logging + telementry integrated to BTP services

> [!tip]
>
> As application developers don't have to care about these complex non-functional requirements, they are free to [focus on domain](#focus-on-domain), i.e., their functional requirements instead.
>
> **Even more important:** many of these crucial cloud qualities are of complex and critical nature, especially tenant isolation and security → it would be a **high risk** to assume each application developer in each project is doing everything in the right ways.

### Enterprise Solutions

- learned from and contributed by real, successful projects and SAP products

### The 'Golden Path'

- as a currated list of best practices and recommended services
- link to the BTP Developers Guide(s)

### Growing Ecosystem

- Active & open community → living in GitHub
- Inner-Source & Opem-Source
- We and you are not alone

## Served Out Of The Box

The CAP runtimes in Node.js and Java provide many generic implementations for recurring tasks and best practices, distilled from proven SAP applications.
Benefits are significantly **accelerated** development, **minimized boilerplate** code, as well as **increased quality** through single points to fix and optimize, hence **reduced technical debt**.


### CAP's Generic Service Providers

- [Serving CRUD Requests](../guides/providing-services#generic-providers)
- [Serving Nested Documents](../guides/providing-services#deep-reads-writes)
- [Serving Media Data](../guides/providing-services#serving-media-data)
- [Serving Draft Choreography](../advanced/fiori#draft-support)

#### Handling Recurring Tasks

- [Implicit Pagination](../guides/providing-services#implicit-pagination)
- [Input Validation](../guides/providing-services#input-validation)
- [Authentication](../node.js/authentication)
- [Authorization](../guides/security/authorization)
- [Localization / i18n](../guides/i18n)
- [Concurrency Control](../guides/providing-services#concurrency-control)

#### Enterprise Best Practices

- [Common Reuse Types & Aspects](../cds/common)
- [Managed Data](../guides/domain-modeling#managed-data)
- [Localized Data](../guides/localized-data)
- [Temporal Data](../guides/temporal-data)
- [Verticalization & Extensibility](../guides/extensibility/)

### CAP-level Integrations ('Calesi')

- [Open Telemetry → SAP Cloud Logging, Dynatrace, ...](../plugins/#telemetry)
- [Attachments → SAP Object Store](../plugins/#attachments)
- [Attachments → SAP Document Management Service](../plugins/#@cap-js/sdm)
- [Messaging → SAP Cloud Application Event Hub](../plugins/#event-broker-plugin) <!-- - [Messaging → Kafka]() -->
- [Change Tracking](../plugins/#change-tracking)
- [Notifications](../plugins/#notifications)
- [Audit Logging](../plugins/#audit-logging)
- [Personal Data Management](../guides/data-privacy/)

[Find more in the **CAP Plugins** page](../plugins/){.learn-more}

[See also the **Features Overview**](./features){.learn-more}


### Intrinsic Extensibility

SaaS customers, verticalization partners, or your teams can...

- Add/overide annotations, translations, initial data
- Add extension fields, entities, relationships
- Add custom logic → in-app + side-by-side
- Bundle and share that as reuse extension packages
- Feature-toggle such pre-built extension packages per tenant

All of that done in the same ways that you can do that in your developments

- Using the same techniques of CDS Aspects and Event Handlers
- Including adaption ad extensions of reuse types/models
- Including extensions to framework-provided services

And all of that available out-of-the-box, i.e. without you having to create extension points. You would want to restrict who can extend what, though.



### Open _and_ Opinionated


That might sound like a contradiction, but isn't: While CAP certainly gives *opinionated* guidance, we do so without sacrificing openness and flexibility.  At the end of the day, you stay in control of which tools or technologies to choose, or which architecture patterns to follow as depicted in the table below.

| CAP is *Opinionated* in...                                   | CAP is *Open* as...                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| **Platform-agnostic APIs** to avoid lock-ins to low-level stuff. | All abstractions follow a glass-box pattern that allows unrestricted access to lower-level things, if required |
| **Best practices**, served out of the box by generic providers | You're free to do things your way in [custom handlers](../guides/providing-services#custom-logic), ... while CAP simply tries to get the tedious tasks out of your way. |
| **Out-of-the-box support** for <br> **[SAP Fiori](https://developers.sap.com/topics/ui-development.html)** and **[SAP HANA](https://developers.sap.com/topics/hana.html)** | You can also choose other UI technologies, like [Vue.js](../get-started/in-a-nutshell#vue). Other databases are supported as well. |
| **Tools support** in [SAP Build Code](../tools/cds-editors#bas) or [VS Code](../tools/cds-editors#vscode). | Everything in CAP can be done using the [`@sap/cds-dk`](../tools/cds-cli) CLI and any editor or IDE of your choice. |





## Focus on Domain

CAP places **primary focus on domain**, by capturing _domain knowledge_ and _intent_ instead of imperative coding — that means, _What, not How_ — which promotes the following:

- Close collaboration of _developers_ and _domain experts_ in domain modeling.
- _Out-of-the-box_ implementations for _best practices_ and recurring tasks.
- _Platform-agnostic_ approach to _avoid lock-ins_, hence _protecting investments_.

### Conceptual Modelling by CDS

### Domain-Driven Design

### Rapid Development

### Minimal Distraction



## Avoid Technical Debt

There's a nice definition of technical debt found at this [glossary by ProductPlan](https://www.productplan.com/glossary/technical-debt/):

*"Technical debt (also known as tech debt or code debt) describes what results when development teams take actions to expedite the delivery of a piece of functionality or a project which later needs to be refactored, or fixed. In other words, it’s the result of prioritizing speedy delivery over perfect code."* {.indent style="font-family:serif"}

So, how could CAP help to avoid — or reduce risks of — piling up technical debt?

...

### Less Code → Less Mistakes

### Single Points to Fix

### Minimized Lock-Ins

### Evolution w/o Disruption


## What about AI?

- AI provides tremendous boosts to productivity → for example:
  - **Coding Assicts** → e.g. by [Copilot](https://en.wikipedia.org/wiki/Microsoft_Copilot) in `.cds`, `.js`, even `.md` sources
  - **Code Analysis** → detecting [bad practices](bad-practices) → guiding to [best practices](best-practices)
  - **Code Generation** → e.g. for tests, test data, ...
  - **Project Scaffolding** → for quick head starts
  - **Search & Learning Assists** → like Maui, ...
- But doesn't replace the need for **Human Intelligence**!
  - There's a different between a GPT-generated one-off thesis and long-lived enterprise software, which needs to adapt and scale to new requirements
- **CAP itself** is a major contribution to AI → its simple, clear concepts, uniform ways to implement and consume services, capire, its openness and visibility in public world, ...



## Caveats

-
