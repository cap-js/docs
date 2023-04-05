---
embed: link
status: released
---
<!--- Migrated: @external/java/400-Development/01-properties/properties.md -> @external/java/development/properties.md -->
# CDS Properties
<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>

The following table lists all configuration properties, that can be used to configure the CAP Java SDK.
::: tip
In property files `<index>` should be replaced with a number and `<key>` with an arbitrary String. In YAML files, you can use standard YAML list and map structures.
::: 

| Property | Type | Default Value | Description |
| --- | --- | --- | --- |
| **cds.environment** |  |  | Properties for environments, like local development or Cloud Foundry. |
| **cds.environment.local** |  |  | Properties for the local environment. |
| `cds.environment.local.defaultEnvPath` | `String` |  | Specification of the default environment JSON file. If this property starts with "classpath:", it is read<br>as classloader resource. Otherwise it is interpreted as file-system path.<br>The file content follows the structure of Cloud Foundry's VCAP_SERVICES and VCAP_APPLICATION environment variables.<br>If this property specifies a folder, the filename `default-env.json` is appended to it. |
| **cds.dataSource** |  |  | Properties for the primary data source, used by the default persistence service. |
| `cds.dataSource.embedded` | `boolean` | `false` | Determines, if the data source is considered embedded (in-memory). |
| `cds.dataSource.binding` | `String` |  | The name of the primary service binding, used by the default persistence service. |
| **cds.dataSource.csv** |  |  | Properties for CSV initialization. |
| `cds.dataSource.csv.initializationMode` | `String` | `embedded` | Determines in which scenarios the default persistence service is initialized with CSV data.<br>By default, CSV initialization only happens, if the data source is embedded (in-memory).<br>Possible values are: `embedded`, `never`, `always`. |
| `cds.dataSource.csv.fileSuffix` | `String` | `.csv` | The file suffix of CSV files. |
| `cds.dataSource.csv.paths` | `List<String>` | `db/data/**, db/csv/**, ../db/data/**, ../db/csv/**` | The file-system paths to search for CSV files in.<br>Using `/**` at the end of the path triggers a recursive search. |
| `cds.dataSource.csv.singleChangeset` | `boolean` | `false` | Enables import of all CSV files in a single changeset. By default, each CSV file is imported in a separate changeset. |
| **cds.dataSource.autoConfig** |  |  | Properties to control the `DataSource` auto-configuration from service bindings. |
| `cds.dataSource.autoConfig.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.model** |  |  | Properties for the CDS model. |
| `cds.model.csnPath` | `String` | `edmx/csn.json` | The resource path to the `csn.json` file. |
| `cds.model.includeUiAnnotations` | `boolean` | `false` | Determines, if UI annotations are included in the model. |
| **cds.model.provider** |  |  | The model provider configuration. |
| `cds.model.provider.url` | `String` |  | The URL of the Model Provider. |
| **cds.model.provider.cache** |  |  | Properties for the CDS model and EDMX metadata caches. |
| `cds.model.provider.cache.maxSize` | `int` | `20` | The number of entries in the CDS model and EDMX metadata caches. |
| `cds.model.provider.cache.expirationTime` | `int` | `600` | The lifetime of an entry in seconds after the entry's creation, the most recent replacement of its value, or its last access. |
| `cds.model.provider.cache.refreshTime` | `int` | `60` | The time in seconds after which a cached entry is refreshed. |
| **cds.security** |  |  | Properties for security configurations of services and endpoints. |
| `cds.security.logPotentiallySensitive` | `boolean` | `false` | Determines, if potentially sensitive data, for example values in CQN queries, might be logged. |
| **cds.security.authentication** |  |  | Properties for authentication in general. |
| `cds.security.authentication.mode` | `String` | `model-strict` | Determines the mode that is used when authenticating endpoints of protocol-adapters. Possible values are:<br>- never: No endpoint requires authentication<br>- model-relaxed: Authentication is derived from @requires/@restrict, defaults to public endpoints.<br>- model-strict: Authentication is derived from @requires/@restrict, defaults to authenticated endpoints.<br>- always: All endpoints require authentication |
| `cds.security.authentication.authenticateMetadataEndpoints` | `boolean` | `true` | Determines, if OData $metadata endpoints enforce authentication. |
| `cds.security.authentication.authenticateUnknownEndpoints` | `boolean` | `true` | Determines, if security configurations enforce authentication for endpoints not managed by protocol-adapters. |
| `cds.security.authentication.normalizeProviderTenant` | `boolean` | `false` | Determines, if the provider tenant is normalized to `null`. |
| **cds.security.authorization** |  |  | Properties for authorization. |
| `cds.security.authorization.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.security.authorization.draftProtection** |  |  | Properties to control the protection of drafts.<br>If a draft is protected, it is only accessible by its creator. |
| `cds.security.authorization.draftProtection.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.security.identity** |  |  | Properties for authentication based on Identity Service (IAS). |
| `cds.security.identity.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.security.identity.authConfig** |  |  | Properties for the Identity Spring security auto-configuration. |
| `cds.security.identity.authConfig.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.security.xsuaa** |  |  | Properties for authentication based on XSUAA. |
| `cds.security.xsuaa.binding` | `String` |  | The name of the XSUAA service binding, used for the XSUAA security auto-configuration. |
| `cds.security.xsuaa.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.security.xsuaa.authConfig** |  |  | Properties for the XSUAA Spring security auto-configuration. |
| `cds.security.xsuaa.authConfig.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.security.mock** |  |  | Properties for authentication based on mock-users. |
| `cds.security.mock.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.security.mock.users** |  |  | The mock-users, used for basic authentication in local development and test scenarios.<br>The key can be chosen arbitrarily and is used as the user name, if the `name` property is not explicitly defined.<br>In addition it can be leveraged to split configuration across multiple profiles. |
| `cds.security.mock.users.<key>.id` | `String` |  | The ID of the mock-user. |
| `cds.security.mock.users.<key>.name` | `String` |  | The (mandatory) name of the mock-user.<br>It's used to perform the basic authentication. |
| `cds.security.mock.users.<key>.password` | `String` |  | The (optional) password of the mock-user.<br>It's used to perform the basic authentication. |
| `cds.security.mock.users.<key>.tenant` | `String` |  | The tenant of the mock-user. |
| `cds.security.mock.users.<key>.systemUser` | `boolean` | `false` | Determines, if this mock-user is treated as a system user. |
| `cds.security.mock.users.<key>.privileged` | `boolean` | `false` | Determines, if this mock-user is treated as the privileged user. |
| `cds.security.mock.users.<key>.internalUser` | `boolean` | `false` | Determines, if this mock-user is treated as the internal user. |
| `cds.security.mock.users.<key>.roles` | `List<String>` |  | The list of roles, that are assigned to this mock-user. |
| `cds.security.mock.users.<key>.features` | `List<String>` |  | The list of enabled feature toggles for this user. If set, it overrules features of the tenant (if provided). |
| `cds.security.mock.users.<key>.attributes` | `Map<String,List<String>>` |  | A map of user attributes, that are assigned to the mock-user.<br>The name of the attribute needs to be given as the key.<br>The attribute values are provided as a list. |
| `cds.security.mock.users.<key>.unrestricted` | `List<String>` |  | A list of attribute names, for which the mock-user has no restrictions.<br>This is treated as if the mock-user effectively had all possible values of this attribute assigned. |
| `cds.security.mock.users.<key>.additional` | `Map<String,Object>` |  | A map of additional properties of the mock-user.<br>It can be used to mock authentication specific properties (e.g. email address).<br>The name of the additional attribute needs to be given as the key.<br>The value of the attribute can be provided as an arbitrary object. |
| **cds.security.mock.defaultUsers** |  |  | Enables a list of default mock-users. |
| `cds.security.mock.defaultUsers.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.security.mock.tenants** |  |  | The tenants in local development and test scenarios.<br>The key can be chosen arbitrarily and is used as the tenant name, if the `name` property is not explicitly defined.<br>In addition it can be leveraged to split configuration across multiple profiles. |
| `cds.security.mock.tenants.<key>.name` | `String` |  | The (mandatory) name of the tenant |
| `cds.security.mock.tenants.<key>.features` | `List<String>` |  | The list of enabled feature toggles for this tenant. |
| **cds.indexPage** |  |  | Properties for the index page. |
| `cds.indexPage.path` | `String` | `/` | The base-path of the adapter endpoint. |
| `cds.indexPage.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.odataV4** |  |  | Properties for the OData V4 protocol adapter. |
| `cds.odataV4.contextAbsoluteUrl` | `boolean` | `false` | Determines, if URLs in the @odata.context response annotation are absolute. |
| `cds.odataV4.edmxPath` | `String` | `edmx/v4` | The JAR resource path to search for OData V4 EDMX files. |
| **cds.odataV4.endpoint** |  |  | Properties of the OData V4 protocol adapter endpoint. |
| `cds.odataV4.endpoint.path` | `String` | `/odata/v4` | The base-path of the adapter endpoint. |
| `cds.odataV4.endpoint.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.odataV4.batch** |  |  | Properties for OData batch requests. |
| `cds.odataV4.batch.maxRequests` | `long` | `-1` | Defines the maximum number of requests within OData batch requests. By default, no limit applies. |
| **cds.odataV2** |  |  | Properties for the OData V2 protocol adapter. |
| `cds.odataV2.edmxPath` | `String` | `edmx/v2` | The JAR resource path to search for OData V2 EDMX files. |
| `cds.odataV2.caseSensitiveFilter` | `boolean` | `true` | Determines whether OData functions 'substringof', 'startswith' and 'endswith' are<br>case-sensitive. |
| **cds.odataV2.endpoint** |  |  | Properties of the OData V2 protocol adapter endpoint. |
| `cds.odataV2.endpoint.path` | `String` | `/odata/v2` | The base-path of the adapter endpoint. |
| `cds.odataV2.endpoint.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.odataV2.batch** |  |  | Properties for OData batch requests. |
| `cds.odataV2.batch.maxRequests` | `long` | `-1` | Defines the maximum number of requests within OData batch requests. By default, no limit applies. |
| **cds.hcql** |  |  | Properties for the HCQL protocol adapter. |
| **cds.hcql.endpoint** |  |  | Properties of the HCQL protocol adapter endpoint. |
| `cds.hcql.endpoint.path` | `String` | `/hcql` | The base-path of the adapter endpoint. |
| `cds.hcql.endpoint.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.messaging** |  |  | Properties for messaging services. |
| **cds.messaging.routes** |  |  | The list of routes for the composite messaging service.<br>The first route that matches is used. Therefore the order of these routes has significance. |
| `cds.messaging.routes.<index>.service` | `String` |  | The target service of the route. |
| `cds.messaging.routes.<index>.events` | `List<String>` |  | The list of events/topics, which are propagated to/from the target service. |
| **cds.messaging.services** |  |  | Properties for messaging services.<br>The key can be chosen arbitrarily and is used as the messaging service name, if the `name` property is not explicitly defined.<br>In addition it can be leveraged to split configuration across multiple profiles. |
| `cds.messaging.services.<key>.name` | `String` |  | The name of the messaging service. |
| `cds.messaging.services.<key>.kind` | `String` |  | The kind of the messaging service.<br>It usually reflects the corresponding service binding type.<br>Possible values are: `local-messaging`, `file-based-messaging`, `enterprise-messaging`, `mqueue-sandbox`. |
| `cds.messaging.services.<key>.binding` | `String` |  | The name of the service binding used for this messaging service.<br>In case of file-based-messaging this specifies the file-system path to the exchange file. |
| `cds.messaging.services.<key>.subscribePrefix` | `String` |  | The string used to prefix topics when subscribing to events. |
| `cds.messaging.services.<key>.publishPrefix` | `String` |  | The string used to prefix topics when publishing events. |
| `cds.messaging.services.<key>.format` | `String` |  | The message format to be assumed on subscriptions and applied when publishing.<br>Possible values are: `cloudevents` |
| `cds.messaging.services.<key>.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.messaging.services.\<key\>.connection** |  |  | Properties for the JMS client connection. |
| `cds.messaging.services.<key>.connection.dedicated` | `boolean` | `false` | Determines, if this messaging service uses its own dedicated JMS client connection.<br>By default, JMS client connections to the same messaging broker are shared. |
| `cds.messaging.services.<key>.connection.properties` | `Map<String,String>` |  | Properties passed to the JMS client connection.<br>The possible keys and values depend on the messaging service implementation. |
| **cds.messaging.services.\<key\>.queue** |  |  | Properties of the queue that is created for the messaging service. |
| `cds.messaging.services.<key>.queue.name` | `String` |  | The name of the queue.<br>The queue may already exist with some custom configuration. In that case the queue is not recreated. |
| `cds.messaging.services.<key>.queue.config` | `Map<String,String>` |  | Properties passed to the messaging broker when creating the queue.<br>The possible keys and values depend on the messaging service implementation. |
| `cds.messaging.services.<key>.queue.subscriptions` | `List<String>` |  | A list of additional topics, that are subscribed on the queue.<br>By default event handler registrations should be used to trigger subscriptions.<br>This property is intended for purposes when subscriptions can not be inferred from event handler registrations. |
| `cds.messaging.services.<key>.queue.forceListening` | `boolean` | `false` | Specifies whether a queue listener should be connected even if no subscription is available. |
| **cds.messaging.services.\<key\>.outbox** |  |  | Properties to control, if and how the Outbox should be used for this messaging service. |
| `cds.messaging.services.<key>.outbox.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.messaging.services.\<key\>.outbox.persistent** |  |  | Controls usage of the persistent Outbox if present. |
| `cds.messaging.services.<key>.outbox.persistent.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.multiTenancy** |  |  | Properties for multitenancy and extensibility. |
| `cds.multiTenancy.componentScan` | `String` |  | Package to be included in the component scan of the Subscribe, Deploy and Unsubscribe main methods. |
| **cds.multiTenancy.endpoint** |  |  | Properties of the subscription HTTP endpoints. |
| `cds.multiTenancy.endpoint.path` | `String` | `/mt/v1.0/subscriptions` | The base-path of the adapter endpoint. |
| `cds.multiTenancy.endpoint.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.multiTenancy.dataSource** |  |  | Properties for the multitenant aware datasource. |
| `cds.multiTenancy.dataSource.pool` | `String` | `hikari` | Pool to use for the multitenant-aware datasource.<br>Possible values are: `hikari`, `tomcat`, `atomikos`. |
| **cds.multiTenancy.dataSource.combinePools** |  |  | Properties to control how the connection pools are maintained.<br>This allows to configure, that the connection pools for tenants contained in the same database are combined. Instead of having a dedicated connection pool for each tenant schema. |
| `cds.multiTenancy.dataSource.combinePools.enabled` | `boolean` | `false` | Determines, if it is enabled. |
| **cds.multiTenancy.serviceManager** |  |  | Properties for the instance-manager / service-manager client. |
| `cds.multiTenancy.serviceManager.timeout` | `int` | `3600` | The timeout for requests in seconds. |
| `cds.multiTenancy.serviceManager.cacheRefreshInterval` | `Duration` | `PT2M` | The cache refresh interval (as Duration). |
| **cds.multiTenancy.security** |  |  | Properties for authorization. |
| `cds.multiTenancy.security.subscriptionScope` | `String` | `mtcallback` | The scope by which the subscription endpoints are authorized. |
| **cds.multiTenancy.sidecar** |  |  | Properties for the MTX sidecar client. |
| `cds.multiTenancy.sidecar.url` | `String` |  | The URL of the MTX sidecar.<br>Setting this property, in combination with a present service-manager service binding, activates the MTX features. |
| `cds.multiTenancy.sidecar.pollingTimeout` | `Duration` | `PT20M` | Specifies the maximum waiting time for the operation to finish. |
| **cds.multiTenancy.sidecar.cache** |  |  | Properties for the sidecar CDS model and EDMX metadata caches. |
| `cds.multiTenancy.sidecar.cache.maxSize` | `int` | `20` | The number of entries in the CDS model and EDMX metadata caches. |
| `cds.multiTenancy.sidecar.cache.expirationTime` | `int` | `600` | The lifetime of an entry in seconds after the entry's creation, the most recent replacement of its value, or its last access. |
| `cds.multiTenancy.sidecar.cache.refreshTime` | `int` | `60` | The time in seconds after which a cached entry is refreshed. |
| **cds.multiTenancy.appUi** |  |  | Properties for the URL to the application's UI endpoints. |
| `cds.multiTenancy.appUi.url` | `String` |  | The URL to the application's UI, used for the 'Go to Application' link. |
| `cds.multiTenancy.appUi.tenantSeparator` | `String` |  | The separator for the tenant in the URL.<br>Possible values are: `.`, `-`. |
| **cds.multiTenancy.healthCheck** |  |  | Properties for health check of the multitenant-aware datasource. |
| `cds.multiTenancy.healthCheck.healthCheckStatement` | `String` |  | The statement that is used when executing a health check of the multitenant-aware datasource. |
| `cds.multiTenancy.healthCheck.interval` | `Duration` | `PT10S` | The time a health check result is cached and no further health checks are performed. |
| `cds.multiTenancy.healthCheck.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.multiTenancy.liquibase** |  |  | Properties for DB lifecycle management via Liquibase. |
| `cds.multiTenancy.liquibase.changeLog` | `String` | `/db/changelog/db.changelog-master.yaml` | The location of the master Liquibase file. |
| `cds.multiTenancy.liquibase.contexts` | `String` |  | Optional: Comma separated list of active contexts. |
| **cds.multiTenancy.provisioning** |  |  | Properties for the ProvisioningService from @sap/cds-mtxs. |
| `cds.multiTenancy.provisioning.pollingTimeout` | `Duration` | `PT10M` | Specifies the maximum waiting time for the provisioning operation to finish. |
| **cds.multiTenancy.mtxs** |  |  | Indicates usage of @sap/cds-mtxs module (MTX streamlined). |
| `cds.multiTenancy.mtxs.enabled` | `boolean` | `false` | Determines, if it is enabled. |
| **cds.multiTenancy.mock** |  |  | Properties for the SQLite-based MTX mock for local development and testing. |
| `cds.multiTenancy.mock.sqliteDirectory` | `String` |  | Path to the directory to start looking for SQLite database files. |
| `cds.multiTenancy.mock.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.multiTenancy.compatibility** |  |  | Properties for the MtSubscriptionService API compatibility mode. |
| `cds.multiTenancy.compatibility.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.persistence** |  |  | Properties for persistence services. |
| **cds.persistence.services** |  |  | Properties for persistence services.<br>The key can be chosen arbitrarily and is used as the persistence service name, if the `name` property is not explicitly defined.<br>In addition it can be leveraged to split configuration across multiple profiles. |
| `cds.persistence.services.<key>.name` | `String` |  | The name of the persistence service. |
| `cds.persistence.services.<key>.binding` | `String` |  | The name of the service binding used for this persistence service. If not set, the name is used. |
| `cds.persistence.services.<key>.dataSource` | `String` |  | The name of the existing data source. If not set, the auto-configured data source of the binding is used. |
| `cds.persistence.services.<key>.transactionManager` | `String` |  | The name of the existing transaction manager. If not set, the transaction manager is automatically created. |
| `cds.persistence.services.<key>.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.application** |  |  | Properties for application services. |
| **cds.application.services** |  |  | Properties for application services.<br>The key can be chosen arbitrarily and is used as the application service name, if the `name` property is not explicitly defined.<br>In addition it can be leveraged to split configuration across multiple profiles. |
| `cds.application.services.<key>.name` | `String` |  | The name of the application service. |
| `cds.application.services.<key>.model` | `String` |  | The qualified name of the CDS service, which is the model definition of this application service.<br>It defaults to the name of the application service itself. |
| **cds.application.services.\<key\>.serve** |  |  | Properties to configure how this service is served by protocol adapters. |
| `cds.application.services.<key>.serve.ignore` | `boolean` | `false` | Determines, if the service is ignored by protocol adapters. |
| `cds.application.services.<key>.serve.path` | `String` |  | The path this service should be served at by protocol adapters.<br>The path is appended to the protocol adapter's base path.<br>If a service is served by multiple protocol adapters, each adapter serves the service under this path. |
| `cds.application.services.<key>.serve.protocols` | `List<String>` |  | The list of protocols adapters this service should be served by.<br>By default the service is served by all available protocol adapters.<br>Possible values are: `odata-v4`, `odata-v2`. |
| **cds.application.services.\<key\>.serve.endpoints** |  |  | Properties to control more fine-grained under which endpoints this service is served.<br>These properties override the more general properties `paths` and `protocols`. |
| `cds.application.services.<key>.serve.endpoints.<index>.path` | `String` |  | The path, this endpoint should be served at by the protocol adapter.<br>The path is appended to the protocol adapter's base path. |
| `cds.application.services.<key>.serve.endpoints.<index>.protocol` | `String` |  | The protocol adapter that serves this endpoint.<br>Possible values are: `odata-v4`, `odata-v2`. |
| **cds.remote** |  |  | Properties for remote services. |
| **cds.remote.services** |  |  | Properties for remote services.<br>The key can be chosen arbitrarily and is mainly intended to be able to split configuration across multiple profiles. |
| `cds.remote.services.<key>.name` | `String` |  | The name of the remote service. |
| `cds.remote.services.<key>.model` | `String` |  | The qualified name of the CDS service, which is the model definition of this remote service.<br>It defaults to the name of the remote service itself. |
| **cds.remote.services.\<key\>.destination** |  |  | Properties to configure a remote destination for this remote service. |
| `cds.remote.services.<key>.destination.type` | `String` | `odata-v4` | The protocol type of the destination.<br>Possible values are: `odata-v4` or `odata-v2`. |
| `cds.remote.services.<key>.destination.name` | `String` |  | The name of the destination in the destination service or SAP Cloud SDK destination accessor. |
| `cds.remote.services.<key>.destination.suffix` | `String` |  | A suffix for this destination, that is appended to the destination's URL. |
| `cds.remote.services.<key>.destination.service` | `String` |  | The name of the service, that is appended to the destination's URL (after the suffix).<br>It defaults to the qualified name of the model definition. |
| `cds.remote.services.<key>.destination.properties` | `Map<String,Object>` |  | A map of generic destination properties supported by SAP Cloud SDK.<br>These properties are used to dynamically build a destination. |
| `cds.remote.services.<key>.destination.headers` | `Map<String,String>` |  | A map of headers and their values, to be added to every outgoing request. |
| `cds.remote.services.<key>.destination.queries` | `Map<String,String>` |  | A map of query parameters and their values, to be added to every outgoing request. |
| `cds.remote.services.<key>.destination.retrievalStrategy` | `String` |  | The retrieval strategy used, when loading destinations from SAP BTP Destination Service.<br>See https://sap.github.io/cloud-sdk/docs/java/features/connectivity/sdk-connectivity-destination-service#retrieval-strategy-options for possible values. |
| `cds.remote.services.<key>.destination.tokenExchangeStrategy` | `String` |  | The token exchange strategy used, when loading destinations from SAP BTP Destination Service.<br>See https://sap.github.io/cloud-sdk/docs/java/features/connectivity/sdk-connectivity-destination-service#token-exchange-options for possible values. |
| **cds.locales** |  |  | Properties for locale configurations. |
| **cds.locales.normalization** |  |  | Properties to configure how locales should be normalized. |
| `cds.locales.normalization.defaults` | `boolean` | `true` | Determines, if the non-normalization include list, as described in the documentation, is applied. |
| `cds.locales.normalization.includeList` | `List<String>` |  | The list of additional locales to add to the include list of non-normalized locales. |
| **cds.errors** |  |  | Properties for error handling. |
| `cds.errors.extended` | `boolean` | `false` | Determines, if error messages are automatically extended with additional debug information (only for development). |
| `cds.errors.combined` | `boolean` | `true` | Determines, if validation error messages are collected and exceptions are thrown at the end of the Before event handler phase. |
| **cds.errors.stackMessages** |  |  | Properties to configure how error messages from the framework are treated.<br>If turned off, only framework error messages, that are explicitly localized are returned.<br>Other errors are mapped to their plain HTTP error code representation. |
| `cds.errors.stackMessages.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.drafts** |  |  | Properties for draft-enabled entities. |
| `cds.drafts.cancellationTimeout` | `Duration` | `PT15M` | The maximum amount of time, since the last change, an entity instance is locked by the user who is editing its draft version. |
| `cds.drafts.deletionTimeout` | `Duration` | `PT720H` | The maximum amount of time a draft is kept, before it is garbage collected. |
| **cds.drafts.gc** |  |  | Properties to configure the automatic draft garbage collection. |
| `cds.drafts.gc.interval` | `Duration` | `PT6H` | The interval, in which the automatic draft garbage collection is triggered. |
| `cds.drafts.gc.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.query** |  |  | Properties for augmentation of CQN queries. |
| **cds.query.limit** |  |  | Properties for server-driven paging. |
| `cds.query.limit.default` | `int` | `0` | The default page size for server-driven paging.<br>Setting this property to 0 or -1 disables the default page size. |
| `cds.query.limit.max` | `int` | `1000` | The maximum page size for server-driven paging.<br>Setting this property to 0 or -1 disables the maximum page size. |
| **cds.query.limit.reliablePaging** |  |  | Properties for reliable server-driven paging, based on last row of ordered result. |
| `cds.query.limit.reliablePaging.enabled` | `boolean` | `false` | Determines, if it is enabled. |
| **cds.query.implicitSorting** |  |  | Properties for the implicit-sorting feature. |
| `cds.query.implicitSorting.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.sql** |  |  | Properties for SQL generation. |
| `cds.sql.supportedLocales` | `String` | `de,fr` | A comma-separated list of locales that are considered during query execution<br>of localized requests. This configuration only has effect on other databases<br>than SAP HANA. It only applies, when the query processing falls back to<br>localized views. |
| `cds.sql.maxBatchSize` | `int` | `1000` | The JDBC batch size used for batch and bulk operations. |
| **cds.sql.hana** |  |  | Configuration properties for an SQL generation on SAP HANA. |
| `cds.sql.hana.ignoreLocale` | `boolean` | `false` | If set to `true`, this property completely disables locale specific handling on SAP HANA. |
| **cds.auditLog** |  |  | Properties for AuditLog configuration. |
| **cds.auditLog.v2** |  |  | Configuration of the AuditLog V2 feature. |
| `cds.auditLog.v2.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.auditLog.personalData** |  |  | Configuration of the Personal Data handler. |
| `cds.auditLog.personalData.throwOnMissingDataSubject` | `boolean` | `false` | If set to {@code true} and the data subject is missing, a `ServiceException` is thrown. |
| `cds.auditLog.personalData.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.auditLog.outbox** |  |  | Properties to configure AuditLog usage of Outbox. |
| `cds.auditLog.outbox.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.auditLog.outbox.persistent** |  |  | Controls usage of the persistent Outbox if present. |
| `cds.auditLog.outbox.persistent.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.auditLog.connectionPool** |  |  | Properties to configure the HTTP connection pool for AuditLog usage. |
| `cds.auditLog.connectionPool.maxConnections` | `Integer` | `200` | The max amount of connections in the pool. |
| `cds.auditLog.connectionPool.maxConnectionsPerRoute` | `Integer` | `20` | The max amount of connections from the pool per route |
| `cds.auditLog.connectionPool.timeout` | `Duration` | `PT1M` | The threshold for connect timeout, socket timeout and connection request timeout. |
| **cds.auditLog.connectionPool.combinePools** |  |  | Properties to control how the http connection pools are maintained.<br>This allows to configure, whether all tenants will share a common http connection pool instead of having a dedicated http connection pool for each tenant. |
| `cds.auditLog.connectionPool.combinePools.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.outbox** |  |  | Properties for Outbox configuration. |
| **cds.outbox.inMemory** |  |  | Properties for the in-memory Outbox. |
| `cds.outbox.inMemory.emitDuringChangeSetContext` | `boolean` | `false` | Specifies whether the outbox emits the event during the current `ChangeSetContext` or afterwards.<br>In case the `ChangeSetContext` wraps a DB transaction, it needs to be considered that<br>emitted messages during the transaction can't be rolled back on cancelled transaction.<br>Messages being emitted after the transaction might get lost, after transaction has been committed successful. |
| `cds.outbox.inMemory.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.outbox.persistent** |  |  | Properties for the persistent Outbox. |
| `cds.outbox.persistent.maxAttempts` | `int` | `10` | Specifies the maximum number of attempts to emit a message stored in the Outbox.<br>Messages that have reached the maximum number of attempts are ignored by the Outbox and need to be handled by the application. |
| `cds.outbox.persistent.enabled` | `boolean` | `true` | Determines, if it is enabled. |
| **cds.outbox.persistent.storeLastError** |  |  | Controls storing the error message of the last error in the Outbox. |
| `cds.outbox.persistent.storeLastError.enabled` | `boolean` | `true` | Determines, if it is enabled. |

