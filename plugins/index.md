---
status: released
---

# CAP Plugins & Enhancements

Following is a curated list of plugins that are available for the SAP Cloud Application Programming Model (CAP) which provide integration with SAP BTP services and technologies, or other SAP products.

::: tip Maintained by CAP and SAP
These plugins are created and maintained in close collaboration and shared ownership of CAP development teams and other SAP and BTP development teams.
:::

:::info Community Plugins
As CAP is blessed with an active community, there are many useful plugins available created by the community. Have a look at the [CAP Community](https://github.com/cap-js-community) repository and browse the available plugins.
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

The [CAP Java plugin technique](../java/plugins) makes use of _jar_-files which are distributed as Maven packages.
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

|    |    |
| --- | --- |
| Node.js | Click the Node.js icon for the plugin to find the repository and open an issue there. 
| Java | Use the community to [ask a question](https://community.sap.com/t5/forums/postpage/board-id/technology-questions/interaction-style/qanda). 

<div id="internal-support" />

## GraphQL Adapter

[@cap-js/graphql](https://www.npmjs.com/package/@cap-js/graphql) {.subtitle}

The GraphQL Adapter is a protocol adapter that generically generates a GraphQL schema for the models of an application and serves an endpoint that allows you to query your services using the [GraphQL](https://graphql.org) query language. All you need to do is to add the `@graphql` annotation to your service definitions like so:

```cds
@graphql service MyService { ... }
```

Available for:

[<img src="../assets/logos/nodejs.svg" style="height:2.5em; display:inline; margin:0 0.2em;" alt="Node.js logo" />](https://github.com/cap-js/graphql)




## OData v2 Proxy

[@cap-js-community/odata-v2-adapter](https://www.npmjs.com/package/@cap-js-community/odata-v2-adapter) {.subtitle}

The OData v2 Proxy is a protocol adapter that allows you to expose your services as OData v2 services. For Node.js, this is provided through the [@cap-js-community/odata-v2-adapter](https://www.npmjs.com/package/@cap-js-community/odata-v2-adapter) plugin, which converts incoming OData V2 requests to CDS OData V4 service calls and responses back. For Java, this is built in.


Available for:

[<img src="../assets/logos/nodejs.svg" style="height:2.5em; display:inline; margin:0 0.2em;" alt="Node.js logo" />](https://github.com/cap-js-community/odata-v2-adapter)
<img src="../assets/logos/java.svg" style="height:3em; display:inline; margin:0 0.2em;" alt="Java logo"/>

See also [_Advanced > OData APIs > V2 Support_](../advanced/odata#v2-support) and the [Java migration guide](../java/migration#v2adapter) {.learn-more}


## UI5 Dev Server

[cds-plugin-ui5](https://www.npmjs.com/package/cds-plugin-ui5) {.subtitle}

The UI5 Dev Server is a CDS server plugin that enables the integration of UI5 (UI5 freestyle or Fiori elements) tooling-based projects into the CDS server via the UI5 tooling express middlewares. It allows to serve dynamic UI5 resources, including TypeScript implementations for UI5 controls, which get transpiled to JavaScript by the plugin automatically.

Available for:

[<img src="../assets/logos/nodejs.svg" style="height:2.5em; display:inline; margin:0 0.2em;" alt="Node.js logo"/>](https://github.com/ui5-community/ui5-ecosystem-showcase/tree/main/packages/cds-plugin-ui5#cds-plugin-ui5)

Click on the icon to get detailed instructions. {.learn-more}



## Change Tracking

[@cap-js/change-tracking](https://npmjs.com/package/@cap-js/change-tracking) {.subtitle}

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

[<img src="../assets/logos/nodejs.svg" style="height:2.5em; display:inline; margin:0 0.2em;" alt="Node.js logo"/>](https://github.com/cap-js/change-tracking)
[<img src="../assets/logos/java.svg" style="height:3em; display:inline; margin:0 0.2em;" alt="Java logo"/>](../java/change-tracking)

## Audit Logging

[@cap-js/audit-logging](https://www.npmjs.com/package/@cap-js/audit-logging) {.subtitle}

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

[<img src="../assets/logos/nodejs.svg" style="height:2.5em; display:inline; margin:0 0.2em;" alt="Node.js logo"/>](https://github.com/cap-js/audit-logging)
<img src="../assets/logos/java.svg" style="height:3em; display:inline; margin:0 0.2em;" alt="Java logo"/>

Learn more about audit logging in [Node.js](../guides/data-privacy/audit-logging) and in [Java](../java/auditlog) {.learn-more}



## Notifications

[@cap-js/notifications](https://www.npmjs.com/package/@cap-js/notifications) {.subtitle}

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

[<img src="../assets/logos/nodejs.svg" style="height:2.5em; display:inline; margin:0 0.2em;" alt="Node.js logo"/>](https://github.com/cap-js/notifications)



## Telemetry (Beta)

[@cap-js/telemetry](https://npmjs.com/package/@cap-js/telemetry) {.subtitle}

The Telemetry plugin provides observability features such as tracing and metrics, including [automatic OpenTelemetry instrumentation](https://opentelemetry.io/docs/concepts/instrumentation/automatic).
Simply add the plugin to your project and you will find telemetry output written to the console as follows:

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

In addition to the default console output, there are predefined kinds for exporting telemetry data to [SAP Cloud Logging](https://help.sap.com/docs/cloud-logging), Dynatrace, and Jaeger.

Available for:

[<img src="../assets/logos/nodejs.svg" style="height:2.5em; display:inline; margin:0 0.2em;" alt="Node.js logo"/>](https://github.com/cap-js/telemetry)


<div id="attachments" />

<div id="internal-plugins" />

<div id="upcoming-plugins" />

<div id="planned-plugins" />
