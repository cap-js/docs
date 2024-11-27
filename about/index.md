# About CAP

Value Propositions {.subtitle}

[[toc]]



## What is CAP?

The _Cloud Application Programming Model_ (CAP) is a framework of languages, libraries, and tools for building *enterprise-grade* cloud applications. It guides developers along a *golden path* of proven [best practices](#enterprise-best-practices), served [out-of-the-box](#served-out-of-the-box), and hence greatly reduces boilerplate code and tedious recurring tasks.

In effect, CAP-based projects benefit from a primary [focus on domain](#focus-on-domain) in close collaboration with domain experts, and from [accelerated development](#grow-as-you-go) at minimised costs. CAP's *agnostic design* shields developers from overly technical disciplines, and fosters [evolution w/o disruption]() in a world of rapidly changing technologies.

## Jumpstart & Grow as you go...

Following the principle of **convention over configuration**, there's no need to set up things upfront. CAP allows you to **jumpstart** projects within seconds and have a team starting development right away, using generic providers, on top of a lightweight in-memory database → see [*Getting Started in a Nutshell*](/get-started/in-a-nutshell).

CAP also offers **mocks for many platform features**, which allow **fast dev-test-run cycles** with minimal development environment complexity — aka *Airplane Mode*. Similarly, CAP facilitates **integration scenarios** by importing an API from, for example, an SAP S/4HANA backend or from SAP Business Accelerator Hub and running mocks for this locally.

Over time, you **add things gradually**, only when they're needed. For example, you can move ahead to running your apps in close-to-productive setups for integration tests and delivery, without any change in models or code.

Finally, projects are encouraged to **parallelize workloads**. For example, following a **contracts-first** approach, a service definition is all that is required to automatically run a full-fledged REST or OData service. So, projects could spawn two teams in parallel: one working on the frontend, while the other one works on the backend part. A third one could start setting up CI/CD and delivery in parallel.



## Accelerated Development

... at Minimized Costs {.subtitle}

## Focus on Domain

CAP places **primary focus on domain**, by capturing _domain knowledge_ and _intent_ instead of imperative coding — that means, _What, not How_ — which promotes the following:

- Close collaboration of _developers_ and _domain experts_ in domain modeling.
- _Out-of-the-box_ implementations for _best practices_ and recurring tasks.
- _Platform-agnostic_ approach to _avoid lock-ins_, hence _protecting investments_.



## Proven Best Practices...
## Served Out Of The Box

The CAP runtimes in Node.js and Java provide many generic implementations for recurring tasks and best practices, distilled from proven SAP applications.
Benefits are significantly **accelerated** development, **minimized boilerplate** code, as well as **increased quality** through single points to fix and optimize, hence **reduced technical debt**.


#### Automatically Serving Requests

- [Serving CRUD Requests](/guides/providing-services#generic-providers)
- [Serving Nested Documents](/guides/providing-services#deep-reads-writes)
- [Serving Media Data](/guides/providing-services#serving-media-data)
- [Serving Draft Choreography](/advanced/fiori#draft-support)

#### Handling Recurring Tasks

- [Implicit Pagination](/guides/providing-services#implicit-pagination)
- [Input Validation](/guides/providing-services#input-validation)
- [Authentication](/node.js/authentication)
- [Authorization](/guides/security/authorization)
- [Localization / i18n](/guides/i18n)
- [Concurrency Control](/guides/providing-services#concurrency-control)

#### Enterprise Best Practices

- [Common Reuse Types & Aspects](/cds/ommon)
- [Managed Data](/guides/domain-modeling#managed-data)
- [Localized Data](/guides/localized-data)
- [Temporal Data](/guides/temporal-data)
- [Verticalization & Extensibility](/guides/extensibility/)

#### Intrinsic Cloud Qualities

- Multitenancy
- Extensibility
- Security
- Scalability
- Resilience

#### **CAP-level Service Integrations ('Calesi')**

- [Open Telementry → SAP Cloud Logging, Dynatrace, ...](/plugins/#telemetry)
- [Attachments → SAP Object Store](/plugins/#attachments)
- [Attachments → SAP Document Management Service](/plugins/#@cap-js/sdm)
- [Messaging → SAP Cloud Application Event Hub](/plugins/#event-broker-plugin)
- [Messaging → Kafka]()
- [Change Tracking](/plugins/#change-tracking)
- [Notifications](/plugins/#notifications)
- [Audit Logging](/plugins/#audit-logging)
- [Personal Data Management](/guides/data-privacy/)

[Find more in the **CAP Plugins** page](/plugins/){.learn-more}

[See also the **Features Overview**](./features){.learn-more}



## Evolution w/o Disruption

## Avoiding Technical Dept

There's a nice definition of technical dept found at this [glossary by ProductPlan](https://www.productplan.com/glossary/technical-debt/):

*"Technical debt (also known as tech debt or code debt) describes what results when development teams take actions to expedite the delivery of a piece of functionality or a project which later needs to be refactored [or fixed]. In other words, it’s the result of prioritizing speedy delivery over perfect code."* {.indent style="font-family:serif"}

So, how could CAP help to avoid — or reduce risks of — piling up technical debt?

...



## Open _and_ Opinionated


That might sound like a contradiction, but isn't: While CAP certainly gives *opinionated* guidance, we do so without sacrificing openness and flexibility.  At the end of the day, you stay in control of which tools or technologies to choose, or which architecture patterns to follow as depicted in the table below.

| CAP is *Opinionated* in...                                   | CAP is *Open* as...                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| **Higher-level concepts and APIs** abstracting from and avoiding lock-ins to low-level platform features and protocols | All abstractions follow a glass-box pattern that allows unrestricted access to lower-level things, if required |
| **Best Practices served out of the box** with generic solutions for many recurring tasks | You can always handle things your way in [custom handlers](/guides/providing-services#custom-logic), decide whether to adopt [CQRS]() or [Event Sourcing](), for example ... while CAP simply tries to get the tedious tasks out of your way. |
| **Out-of-the-box support** for <br> **[SAP Fiori](https://developers.sap.com/topics/ui-development.html)** and **[SAP HANA](https://developers.sap.com/topics/hana.html)** | You can also choose other UI technologies, like [Vue.js](/get-started/in-a-nutshell#vue), or databases, by providing new database integrations. |
| **Dedicated tools support** provided in [SAP Business Application Studio](/tools/cds-editors#bas) or [Visual Studio Code](/tools/cds-editors#vscode). | CAP doesn't depend on those tools. Everything in CAP can be done using the [`@sap/cds-dk`](/tools/cds-cli) CLI and any editor or IDE of your choice. |

