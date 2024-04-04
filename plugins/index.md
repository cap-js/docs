---
status: released
---

# CAP Plugins & Enhancements

Following is a curated list of plugins that are available for the SAP Cloud Application Programming Model (CAP) which provide integration with SAP BTP services and technologies, or other SAP products.

::: tip Maintained by CAP and SAP
The `@cap-js`-scoped plugins are created and maintained in close collaboration and shared ownership of CAP development teams and other SAP development teams.
:::

[[toc]]

<style scoped>
   main .vp-doc h2 + .subtitle {
      font-style: italic;
      margin: -44px 0 40px;
   }
   main .vp-doc a:has(> img) {
      display: inline-flex;
      align-items: center;
      transition: opacity 0.2s;
   }
   main .vp-doc a:has(> img):hover {
      opacity: 0.7;
   }
   main .vp-doc a:has(> img):not(:last-child) {
      margin-right: 1em;
   }
</style>



## As _cds-plugins_ for Node.js

For Node.js all these plugins are implemented using the [`cds-plugin`](../node.js/cds-plugins) technique, which features minimalistic setup and **plug & play** experience. Usually usage is as simple as that, like for the [Audit Logging](../guides/data-privacy/audit-logging) plugin:

1. Add the plugin:

   ```sh
   npm add @cap-js/audit-logging
   ```

2. Add annotations to your models:

   ```cds
   annotate Customer with @PersonalData ...;
   ```

3. Test-drive locally:

   ```sh
   cds watch
   ```
   > → audit logs are written to console in dev mode.

4. Bind the platform service.

   > → audit logs are written to Audit Log service in production.

## As Plugin for CAP Java

The [CAP Java plugin technique](../java/building-plugins) makes use of _jar_-files which are distributed as Maven packages.
By adding an additional Maven dependency to the project, the plugin automatically adds functionality or extensions to the CDS model.
For [Audit Logging V2](../java/auditlog#handler-v2) it looks like this:

1. Add the Maven dependency (in _srv/pom.xml_):
   ```xml
   <dependency>
     <groupId>com.sap.cds</groupId>
     <artifactId>cds-feature-auditlog-v2</artifactId>
     <scope>runtime</scope>
   </dependency>
   ```
2. Add annotations to your model:

   ```cds
   annotate Customer with @PersonalData ...;
   ```
   > → audit logs are written to console in dev mode.

3. Bind the platform service.

   > → audit logs are written to SAP Audit Log service.

## Support for Plugins

Use one of the support channels below, in this order:

1. Open an issue in the **plugin's GitHub repository**.

   Find the link in the plugin list below (if the plugin has a public repository).

2. Ask a question in the [SAP community](/resources/ask-question-vscode).

   This applies to all plugins, especially those without public repositories. Or if you're not quite sure that the problem is caused by the plugin.

3. Open incidents through [SAP Support Portal](/resources/#support-channels).

   Note that plugins by external parties, like the [CAP JS](https://github.com/cap-js-community/) community, are out of scope for incidents.

:::tip Public channels help everyone.
Prefer public repositories and issues over private/internal ones, as they help everyone using CAP to find solutions quickly.
:::


<div id="internal-support" />

<br>

:::info Complete list of plugins
As CAP is blessed with an active community, there are many useful plugins available created by the community. Have a look at the [CAP JS community](https://github.com/cap-js-community) to browse all available plugins. A broader collection of plugins can be found at [bestofcapjs.org](https://bestofcapjs.org/)
:::


## Attachments <Badge type="warning" text="beta" title="" />


The Attachments plugin provides out-of-the-box asset storage and handling. To use it, extend a domain model by using the predefined `aspect` called Attachments:

```cds
extend my.Incidents with {
  attachments: Composition of many Attachments
}
```

It also provides a CAP-level, easy-to-use integration of the [SAP Object store](https://discovery-center.cloud.sap/serviceCatalog/object-store).

Features:

- Supports CRUD operations for attachments with SAP Object Store.
- Automatically adds the necessary `Attachments` table in the application.


Available for:

[<img src="../assets/logos/nodejs.svg" style="height:2.5em; display:inline; margin:0 0.2em;" alt="link to the repository for cap-js attachments"/>](https://github.com/cap-js/attachments#readme)


## Audit Logging


The new Audit Log plugin provides out-of-the box support for logging personal data-related operations with the [SAP Audit Log Service](https://discovery-center.cloud.sap/serviceCatalog/audit-log-service). All we need is annotations of respective entities and fields like that:

```cds
annotate my.Customers with @PersonalData {
  ID           @PersonalData.FieldSemantics: 'DataSubjectID';
  name         @PersonalData.IsPotentiallyPersonal;
  email        @PersonalData.IsPotentiallyPersonal;
  creditCardNo @PersonalData.IsPotentiallySensitive;
}
```

Features:

- Simple, Annotation-based usage → automatically logging personal data-related events
- CAP Services-based programmatic client API → simple, backend-agnostic
- Logging to console in development → fast turnarounds, minimized costs
- Logging to [SAP Audit Log Service](https://discovery-center.cloud.sap/serviceCatalog/audit-log-service) in production
- Transactional Outbox → maximised scalability and resilience

Available for:

[<img src="../assets/logos/nodejs.svg" style="height:2.5em; display:inline; margin:0 0.2em;" alt="Node.js"/>](https://github.com/cap-js/audit-logging#readme)
<img src="../assets/logos/java.svg" style="height:3em; display:inline; margin:0 0.2em;" alt="Java"/>

Learn more about audit logging in [Node.js](../guides/data-privacy/audit-logging) and in [Java](../java/auditlog) {.learn-more}


## Change Tracking


The Change Tracking plugin provides out-of-the box support for automated capturing, storing, and viewing of the change records of modeled entities. All we need is to add @changelog annotations to your models to indicate which entities and elements should be change-tracked.

```cds
annotate my.Incidents {
  customer @changelog: [customer.name];
  title    @changelog;
  status   @changelog;
}
```

![Change history table in an SAP Fiori UI.](assets/index/changes.png)

Available for:

[<img src="../assets/logos/nodejs.svg" style="height:2.5em; display:inline; margin:0 0.2em;" alt="Node.js"/>](https://github.com/cap-js/change-tracking#readme)
[<img src="../assets/logos/java.svg" style="height:3em; display:inline; margin:0 0.2em;" alt="Java"/>](../java/change-tracking)



## GraphQL Adapter

The GraphQL Adapter is a protocol adapter that generically generates a GraphQL schema for the models of an application and serves an endpoint that allows you to query your services using the [GraphQL](https://graphql.org) query language. All you need to do is to add the `@graphql` annotation to your service definitions like so:

```cds
@graphql service MyService { ... }
```

Available for:

[<img src="../assets/logos/nodejs.svg" style="height:2.5em; display:inline; margin:0 0.2em;" alt="Node.js" />](https://github.com/cap-js/graphql#readme)



## Notifications


The Notifications plugin provides integration with the [SAP Alert Notifications](https://discovery-center.cloud.sap/serviceCatalog/alert-notification) service to send notifications via email, Slack, Microsoft Teams, or SAP Fiori notifications. The client is implemented as a CAP service, which gives us a very simple programmatic API:

```js
let alert = await cds.connect.to ('notifications')
await alert.notify({
   recipients: [ ...supporters ],
   title: `New incident created by ${customer.info}`,
   description: incident.title
})
```

Features:

- CAP Services-based programmatic client API → simple, backend-agnostic
- Logging to console in development → fast turnarounds, minimized costs
- Sending to [SAP Alert Notification Service](https://discovery-center.cloud.sap/serviceCatalog/alert-notification) in production
- Transactional Outbox → maximised scalability and resilience
- Notification templates with i18n support
- Automatic lifecycle management of notification templates
- SAP ANS supports email, Slack, Microsoft Teams, and SAP Fiori notifications


Available for:

[<img src="../assets/logos/nodejs.svg" style="height:2.5em; display:inline; margin:0 0.2em;" alt="Node.js"/>](https://github.com/cap-js/notifications#readme)



## OData v2 Proxy


The OData v2 Proxy is a protocol adapter that allows you to expose your services as OData v2 services. For Node.js, this is provided through the [@cap-js-community/odata-v2-adapter](https://www.npmjs.com/package/@cap-js-community/odata-v2-adapter) plugin, which converts incoming OData V2 requests to CDS OData V4 service calls and responses back. For Java, this is built in.


Available for:

[<img src="../assets/logos/nodejs.svg" style="height:2.5em; display:inline; margin:0 0.2em;" alt="Node.js" />](https://github.com/cap-js-community/odata-v2-adapter#readme)
[<img src="../assets/logos/java.svg" style="height:3em; display:inline; margin:0 0.2em;" alt="Java"/>](../java/migration#v2adapter)

See also [Cookbook > Protocols/APIs > OData APIs > V2 Support](../advanced/odata#v2-support) {.learn-more}


## Telemetry (Beta)


The Telemetry plugin provides observability features such as tracing and metrics, including [automatic OpenTelemetry instrumentation](https://opentelemetry.io/docs/concepts/instrumentation/automatic).
By enabling the plugin in your project, various kinds of telemetry data will be automatically collected. For Node.js, you will find telemetry output written to the console as follows:

```txt
[odata] - GET /odata/v4/processor/Incidents
[telemetry] - elapsed times:
  0.00 → 2.85 = 2.85 ms  GET /odata/v4/processor/Incidents
  0.47 → 1.24 = 0.76 ms    ProcessorService - READ ProcessorService.Incidents
  0.78 → 1.17 = 0.38 ms      db - READ ProcessorService.Incidents
  0.97 → 1.06 = 0.09 ms        @cap-js/sqlite - prepare SELECT json_object('ID',ID,'createdAt',createdAt,'creat…
  1.10 → 1.13 = 0.03 ms        @cap-js/sqlite - stmt.all SELECT json_object('ID',ID,'createdAt',createdAt,'crea…
  1.27 → 1.88 = 0.61 ms    ProcessorService - READ ProcessorService.Incidents.drafts
  1.54 → 1.86 = 0.32 ms      db - READ ProcessorService.Incidents.drafts
  1.74 → 1.78 = 0.04 ms        @cap-js/sqlite - prepare SELECT json_object('ID',ID,'DraftAdministrativeData_Dra…
  1.81 → 1.85 = 0.04 ms        @cap-js/sqlite - stmt.all SELECT json_object('ID',ID,'DraftAdministrativeData_Dr…
```

Telemetry data can be exported to [SAP Cloud Logging](https://help.sap.com/docs/cloud-logging) and Dynatrace. Node.js additionally supports Jaeger.

Available for:

[<img src="../assets/logos/nodejs.svg" style="height:2.5em; display:inline; margin:0 0.2em;" alt="Node.js"/>](https://github.com/cap-js/telemetry#readme)
[<img src="../assets/logos/java.svg" style="height:3em; display:inline; margin:0 0.2em;" alt="Java"/>](../java/operating-applications/observability#open-telemetry)



## UI5 Dev Server


The UI5 Dev Server is a CDS server plugin that enables the integration of UI5 (UI5 freestyle or Fiori elements) tooling-based projects into the CDS server via the UI5 tooling express middlewares. It allows to serve dynamic UI5 resources, including TypeScript implementations for UI5 controls, which get transpiled to JavaScript by the plugin automatically.

Available for:

[<img src="../assets/logos/nodejs.svg" style="height:2.5em; display:inline; margin:0 0.2em;" alt="Node.js"/>](https://github.com/ui5-community/ui5-ecosystem-showcase/tree/main/packages/cds-plugin-ui5#cds-plugin-ui5)



<div id="internal-plugins" />

<div id="upcoming-plugins" />

<div id="planned-plugins" />


