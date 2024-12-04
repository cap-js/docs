---
status: released
---

# About CAP

Value Propositions {.subtitle}

[[toc]]



## What is CAP?

The _Cloud Application Programming Model_ (CAP) is a framework of languages, libraries, and tools for building *enterprise-grade* cloud applications. It guides developers along a *golden path* of **proven best practices**, which are **served out of the box** by generic providers cloud-natively, thereby relieving application developers from tedious recurring tasks.

In effect, CAP-based projects benefit from a primary **focus on domain**, with close collaboration of developers and domain experts, **rapid development** at **minimized costs**, as well as **avoiding technical depts** by eliminating exposure to, and lock-ins to volatile low-level technologies.



## Jumpstart & Grow As You Go...
###### grow-as-you-go



### Jumpstarting Projects

To start a CAP projects there's close to no setup required. No tedious long lasting platform onboarding ceremonies are required; instead:

- we start new CAP projects within seconds, ...
- create functional apps with full-fledged servers within minutes, ...
- without prior onboarding to or being connected to the cloud

```sh
cds init
cds watch
```

> [!tip]
>
> Following the principle of *convention over configuration*, CAP uses built-in configuration presets and defaults for different profiles. For development profile there's all set up.



### Growing as You Go...

Add things only when you need them or when you know more. Avoid any premature descisions or upfront overhead. For example, typical CAP projects run like that:

1. **jumpstart a project** → no premature decisions to be made at that stage, just the name.
2. **rapidly build a prototype**, i.e. a first functional version of your app
3. **work in fast inner loops** in airplane mode, and only occassionally go hybrid.
4. **add new features** anytime, like Fiori UIs, message queues, different databases, etc.
5. do **first ad-hoc deployment** to the clouds some days later
6. setup **CI/CD pipelines** some weeks later
7. switch on **multitenancy** for SaaS apps, probably also **extensibility**, before going live
8. optionally cut out some **micro services** only if required and months later earliest

```sh
cds add hana,redis,mta,helm,mtx,multitenancy,extensibility...
```

> [!tip]
>
> Avoid futile upfront setup and overhead and rather get started and a first prototype up and running as fast as possible... Maybe find out quickly that this product idea you or somebody else had was a bad idea anyways, so rather stop early ...



### Fast Inner Loops

CAP offers mocks for many platform features, which allow fast dev-test-run cycles with minimal development environment complexity — aka *Airplane Mode*.

Similarly, CAP facilitates integration scenarios. You can import an API from, for example, an SAP S/4HANA backend or from SAP Business Accelerator Hub and run mocks for this locally.



### Loose Coupling

Finally, projects are encouraged to **parallelize workloads**. For example, following a **contracts-first** approach, a service definition is all that is required to automatically run a full-fledged REST or OData service. So, projects could spawn two teams in parallel: one working on the frontend, while the other one works on the backend part. A third one could start setting up CI/CD and delivery in parallel.

### Minimized Costs

Over time, you **add things gradually**, only when they're needed. For example, you can move ahead to running your apps in close-to-productive setups for integration tests and delivery, without any change in models or code.



### Late-cut Microservices



## Proven Best Practices

### Cloud-Native by Design

CAP's [service-centric paradigm](best-practices#services) is designed from the ground up for cloud-scale enterprise applications. Its core design principles of flyweight, stateless services processing passive, immutable data, complemented by an intrinsic, ubiquitous [events-based](best-practices#events) processing model greatly promote scalability and resilience.

On top of that, several built-in facilities address many things to care about in cloud-based apps out of the box, such as:

- **Multitenancy** → tenant *isolation* at runtime; *deploy*, *subscribe*, *update* handled by MTX
- **Extensibility** → for customers to tailor SaaS apps to their needs →  [see below...](#intrinsic-extensibility)
- **Security** → CAP+plugins do authentications, certificates, mTLS, ...
- **Scalability** → by stateless services, passive data, messaging, ...
- **Resilience** → by messaging, tx outbox, outboxed audit logging, ...
- **Observability** → by logging + telemetry integrated to BTP services

> [!tip]
>
> As application developers don't have to care about these complex non-functional requirements, instead they're free to [focus on domain](#focus-on-domain), that is, their functional requirements.
>
> **Even more important:** many of these crucial cloud qualities are of complex and critical nature, especially tenant isolation and security → it would be a **high risk** to assume each application developer in each project is doing everything in the right ways.

### Enterprise Solutions

- learned from and contributed by real, successful projects and SAP products

### The 'Golden Path'

- as a curated list of best practices and recommended services
- link to the BTP Developers Guide

### Growing Ecosystem

- Active & open community → living in GitHub
- Inner-Source & Open-Source
- We and you are not alone

## Served Out Of The Box

The CAP runtimes in Node.js and Java provide many generic implementations for recurring tasks and best practices, distilled from proven SAP applications.
Benefits are significantly **accelerated** development, **minimized boilerplate** code, as well as **increased quality** through single points to fix and optimize, hence **reduced technical debt**.


### CAP's Generic Service Providers

- [Serving CRUD Requests](../guides/providing-services#generic-providers)
- [Serving Nested Documents](../guides/providing-services#deep-reads-and-writes)
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

All of these tasks are done in the same way as you do in your own projects:

- Using the same techniques of CDS Aspects and Event Handlers
- Including adaption ad extensions of reuse types/models
- Including extensions to framework-provided services

And all of that is available out of the box, that is, without you having to create extension points. You would want to restrict who can extend what, though.



### Open _and_ Opinionated


That might sound like a contradiction, but it isn't: While CAP certainly gives *opinionated* guidance, we do so without sacrificing openness and flexibility.  At the end of the day, you stay in control of which tools or technologies to choose, or which architecture patterns to follow as depicted in the following table.

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

### Conceptual Modeling by CDS

### Domain-Driven Design

### Rapid Development

### Minimal Distraction



## Avoid Technical Debt

There's a nice definition of technical debt found at this [glossary by ProductPlan](https://www.productplan.com/glossary/technical-debt/):

*"Technical debt (also known as tech debt or code debt) describes what results when development teams take actions to expedite the delivery of a piece of functionality or a project which later needs to be refactored, or fixed. In other words, it’s the result of prioritizing speedy delivery over perfect code."* {.indent style="font-family:serif"}

So, how could CAP help to avoid — or reduce the risks of — piling up technical debt?

### Less Code → Less Mistakes

### Single Points to Fix

### Minimized Lock-Ins

### Evolution w/o Disruption
{#evolution-wo-disruption}

Keeping pace with a rapidly changing world of volatile cloud technologies and platforms is a major challenge, as today's technologies that might soon become obsolete. CAP avoids such lock-ins and shields application developers from low-level things like:

- Low-level **Security**-related things like Certificates, mTLS, SAML, OAuth, OpenID, ...
- **Service Bindings** like K8s secrets, VCAP_SERVICES, ...
- **Multitenancy**-related things, especially w.r.t. tenant isolation
- **Messaging** protocols or brokers such as AMQP, MQTT, Webhooks, Kafka, Redis, ...
- **Networking** protocols such as HTTP, gRCP, OData, GraphQL, SOAP, RFC, ...
- **Audit Logging** → use the *Calesi* variant, which provides ultimate resilience
- **Logs**, **Traces**, **Metrics** → CAP does that behind the scenes + provides *Calesi* variants
- **Transaction Management** → CAP manages all transactions → don't mess with that!

> [!tip]
>
> CAP not only abstracts these things at scale, but also does most things automatically in the background. In addition, it allows us to provide various implementations that encourage *Evolution w/o Disruption*, as well as fully functional mocks used in development.

> [!caution]
>
> Things get dangerous when application developers have to deal with low-level security-related things like authentication, certificates, tenant isolation, and so on. Whenever this happens, it's a clear sign that something is seriously wrong.


## What about AI?

- AI provides tremendous boosts to productivity → for example:
  - **Coding Assists** → for example, by [Copilot](https://en.wikipedia.org/wiki/Microsoft_Copilot) in `.cds`, `.js`, even `.md` sources
  - **Code Analysis** → detecting [bad practices](bad-practices) → guiding to [best practices](best-practices)
  - **Code Generation** → for example, for tests, test data, ...
  - **Project Scaffolding** → for quick head starts
  - **Search & Learning Assists** → like Maui, ...
- But this doesn't replace the need for **Human Intelligence**!
  - There's a different between a GPT-generated one-off thesis and long-lived enterprise software, which needs to adapt and scale to new requirements.
- **CAP itself** is a major contribution to AI → its simple, clear concepts, uniform ways to implement and consume services, capire, its openness and visibility in the public world, ...



## Caveats

-
