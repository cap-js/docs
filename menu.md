
### Getting Started

- [Introduction — About CAP](about/)
- [Get Started in a Nutshell](get-started/in-a-nutshell)
- [Jumpstart Development](get-started/jumpstart)
- [Grow As You Go...](get-started/grow-as-you-go)
- [Hello World!](get-started/hello-world)
- [Sample Projects](get-started/samples)
- [Learning Sources](get-started/learning-sources)
- [Troubleshooting](get-started/troubleshooting)

### [Cookbook](guides/)

- [Domain Modeling](guides/domain-modeling)

  - [Domain Entities](guides/domain-modeling#domain-entities)
  - [Associations](guides/domain-modeling#associations)
  - [Aspects](guides/domain-modeling#aspects)
  - [Managed Data](guides/domain-modeling#managed-data)
  - [Best Practices](guides/domain-modeling#best-practices)

- [Providing Services](guides/providing-services)

  - [Intro: Core Concepts](guides/providing-services#introduction)
  - [Service Definitions](guides/providing-services#service-definitions)
  - [Generic Providers](guides/providing-services#generic-providers)
  - [Input Validation](guides/providing-services#input-validation)
  - [Custom Logic](guides/providing-services#custom-logic)
  - [Actions & Functions](guides/providing-services#actions-functions)
  - [Serving Media Data](guides/providing-services#serving-media-data)
  - [Best Practices](guides/providing-services#best-practices)

- [Consuming Services](guides/using-services)

  - [Introduction](guides/using-services#introduction)
  - [Import APIs](guides/using-services#external-service-api)
  - [Mocking](guides/using-services#local-mocking)
  - [Querying](guides/using-services#execute-queries)
  - [Mashups](guides/using-services#integrate-and-extend)
  - [Deployment](guides/using-services#connect-and-deploy)

- [Events & Messaging](guides/messaging/)

  - [Events from S/4](guides/messaging/s4)
  - [SAP Event Mesh](guides/messaging/event-mesh)

- [Protocols/APIs](advanced/publishing-apis/)

  - [OData APIs](advanced/odata)
  - [OpenAPI](advanced/publishing-apis/openapi)
  - [AsyncAPI](advanced/publishing-apis/asyncapi)

- [Serving UIs](advanced/fiori)
  - [Fiori UIs](advanced/fiori)

- [Databases](guides/databases)

  - [Common](guides/databases)
  - [SQLite](guides/databases-sqlite)
  - [H2 (Java)](guides/databases-h2)
  - [PostgreSQL](guides/databases-postgres)
  - [SAP HANA Cloud](guides/databases-hana)
  - [SAP HANA Native](advanced/hana)

- [Analytics](advanced/analytics)

- [Localization, i18n](guides/i18n)
- [Localized Data](guides/localized-data)
- [Temporal Data](guides/temporal-data)

<!-- ### [Advanced](advanced/) -->

- [Security](guides/security/)

  - [CDS-based Authorization](guides/security/authorization)
  - [Platform Security](guides/security/overview)
  - [Security Aspects](guides/security/aspects)
  - [Data Protection & Privacy](guides/security/data-protection-privacy)

- [Data Privacy](guides/data-privacy/)

  - [Annotating Personal Data](guides/data-privacy/annotations)
  - [Automatic Audit Logging](guides/data-privacy/audit-logging)
  - [Personal Data Management](guides/data-privacy/pdm)
  - [Data Retention Management](guides/data-privacy/drm)

- [Performance](advanced/performance-modeling)

### [CDS](cds/)

- [Definition Language (CDL)](cds/cdl)
- [Schema Notation (CSN)](cds/csn)
- [Query Language (CQL)](cds/cql)
- [Query Notation (CQN)](cds/cqn)
- [Expressions (CXN)](cds/cxn)
- [Built-in Types](cds/types)
- [Common Types and Aspects](cds/common)
- [Common Annotations](cds/annotations)
- [Nature of Models](cds/models)

### [Node](node.js/)

- [The cds Facade](node.js/cds-facade)

- [cds. Services](node.js/core-services)

  - [Class cds. Service](node.js/core-services)
  - [Class cds. ApplicationService](node.js/app-services)
  - [Class cds. RemoteService](node.js/remote-services)
  - [Class cds. MessagingService](node.js/messaging)
  - [Class cds. DatabaseService](node.js/databases)
  - [Class cds. SQLService](node.js/databases)

- [cds. Events](node.js/events)

  - [cds. context](node.js/events#cds-context)
  - [Class cds. EventContext](node.js/events#cds-event-context)
  - [Class cds. Event](node.js/events#cds-event)
  - [Class cds. Request](node.js/events#cds-request)

- [cds. compile()](node.js/cds-compile)

  - [cds. compile()](node.js/cds-compile#cds-compile)
  - [cds. compile.to ...](node.js/cds-compile#cds-compile-to)
  - [cds. load()](node.js/cds-compile#cds-load)
  - [cds. parse()](node.js/cds-compile#cds-parse)
  - [cds. minify()](node.js/cds-compile#cds-minify)
  - [cds. resolve()](node.js/cds-compile#cds-resolve)

- [cds. reflect()](node.js/cds-reflect)

  - [Class LinkedCSN](node.js/cds-reflect#linked-csn)
  - [Class LinkedDefinitions](node.js/cds-reflect#iterable)
  - [Class LinkedDefinition](node.js/cds-reflect#any)
  - [Class cds. service](node.js/cds-reflect#cds-service)
  - [Class cds. entity](node.js/cds-reflect#cds-entity)
  - [Class cds. struct](node.js/cds-reflect#cds-struct)
  - [Class cds. Association](node.js/cds-reflect#cds-association)
  - [cds. linked. classes](node.js/cds-reflect#cds-linked-classes)

- [cds. server()](node.js/cds-server)
- [cds. serve()](node.js/cds-serve)
- [cds. connect()](node.js/cds-connect)

- [cds. ql](node.js/cds-ql)

  - [SELECT](node.js/cds-ql#select)
  - [INSERT](node.js/cds-ql#insert)
  - [UPSERT](node.js/cds-ql#upsert)
  - [UPDATE](node.js/cds-ql#update)
  - [DELETE](node.js/cds-ql#delete)

- [cds. tx()](node.js/cds-tx)
- [cds. log()](node.js/cds-log)
- [cds. env](node.js/cds-env)
- [cds. auth](node.js/authentication)
- [cds. i18n](node.js/cds-i18n)
- [cds. utils](node.js/cds-utils)
- [cds. test()](node.js/cds-test)
- [cds. plugins](node.js/cds-plugins)
- [TypeScript](node.js/typescript)
- [Fiori Support](node.js/fiori)
- [Best Practices](node.js/best-practices)

### [Java](java/)

- [Getting Started](java/getting-started)
- [Versions & Dependencies](java/versions)
- [Working with CDS Models](java/reflection-api)
- [Working with CDS Data](java/cds-data)
- [Working with CDS CQL](java/working-with-cql/)
  - [Build CQL Statements](java/working-with-cql/query-api)
  - [Execute CQL Statements](java/working-with-cql/query-execution)
  - [Introspect CQL Statements](java/working-with-cql/query-introspection)
- [Services](java/services)
- [CQN Services](java/cqn-services/)
  - [Persistence Services](java/cqn-services/persistence-services)
  - [Application Services](java/cqn-services/application-services)
  - [Remote Services](java/cqn-services/remote-services)
- [Event Handlers](java/event-handlers/)
  - [Indicating Errors](java/event-handlers/indicating-errors)
  - [Request Contexts](java/event-handlers/request-contexts)
  - [ChangeSet Contexts](java/event-handlers/changeset-contexts)
- [Messaging](java/messaging)
- [Audit Logging](java/auditlog)
- [Transactional Outbox](java/outbox)
- [Security](java/security)
- [Spring Boot Integration](java/spring-boot-integration)
- [Developing Applications](java/developing-applications/)
  - [Building](java/developing-applications/building)
  - [Running](java/developing-applications/running)
  - [Testing](java/developing-applications/testing)
  - [Configuring](java/developing-applications/configuring)
  - [CDS Properties](java/developing-applications/properties)
- [Operating Applications](java/operating-applications/)
  - [Optimizing](java/operating-applications/optimizing)
  - [Observability](java/operating-applications/observability)
- [Migration Guides](java/migration)

### [Tools](tools/)

- [CDS Command Line Interface](tools/cds-cli)
- [CDS Editors & IDEs](tools/cds-editors)
- [CDS Lint](tools/cds-lint/)
  - [Rules Reference #items:rules-sidebar](tools/cds-lint/rules)
- [CDS Typer](tools/cds-typer)
- [CAP Notebooks](tools/cds-editors#cap-vscode-notebook)
- [Hybrid Testing w/ cds bind](advanced/hybrid-testing)
- [CDS Design Time APIs](tools/apis/)
  - [cds. add()](tools/apis/cds-add)
  - [cds. import()](tools/apis/cds-import)

### [Plugins](plugins/)

- [OData v2 Proxy](plugins/#odata-v2-proxy)
- [UI5 Dev Server](plugins/#ui5-dev-server)
- [GraphQL Adapter](plugins/#graphql-adapter)
- [Audit Logging](plugins/#audit-logging)
- [Change Tracking](plugins/#change-tracking)
- [Notifications](plugins/#notifications)
- [Telemetry](plugins/#telemetry)
- [CAP Operator for K8s](plugins/#cap-operator-plugin)
