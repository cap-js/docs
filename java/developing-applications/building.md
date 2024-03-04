---
synopsis: >
  This section describes various options to create a CAP Java project from scratch, to build your application with Maven, and to modify an existing project with the CDS Maven plugin.

status: released
redirect_from: java/architecture
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/9186ed9ab00842e1a31309ff1be38792.html
---

# Building Applications
<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>

One of the key [CAP design principles](../about/#open-and-opinionated) is to be an opinionated but yet open framework. 
Giving a clear guidance for cutting-edge technologies on the one hand and still keeping the door wide open for custom choice on the other hand, demands a highly flexible CAP Java runtime stack.
The [modular architecture](#modular_architecture) reflects this requirement, allowing a fine-grained and flexible [configuration](#stack_configuration) based on standard or custom modules.
  
## Modular Stack Architecture { #modular_architecture}

### Overview

One of the basic design principle of the CAP Java is to keep orthogonal functionality separated in independent components. 
The obvious advantage of this decoupling is that it makes concrete components exchangeable independently.
Hence, it reduces the risk of expensive adaptions in custom code, which can be necessary due to new requirements with regards to the platform environment or used version of platform services. 
Hence, the application is [platform **and** service agnostic](../about/#agnostic-approach).

For instance, custom code doesn't need to be written against the chosen type of persistence service, but can use the generic persistence service based on [CQL](./query-api). 
Likewise, the application isn't aware of the concrete (cloud) platform environment in which it gets embedded. 
Consequently, preparing an application to be deployable in different platform contexts is rather a matter of configuration than of code adaption.

Consequently, CAP Java doesn't determine the technology the application is built on.
But it comes with a chosen set of industry-proven frameworks that can be consumed easily. 
Nevertheless, you can override the defaults separately depending on the demands in your scenario.

Moreover, the fine-grained modularization allows you to assemble a minimum set of components, which is necessary to fulfill the application-specific requirements. 
This reduces resource consumption at runtime as well as maintenance costs significantly.

Another helpful result of the described architecture is that it simplifies local testing massively. 
Firstly, as components are coupled weakly, you can define the actual test scope precisely and concentrate on the parts that need a high test coverage. 
Components outside of the test scope are replaceable with mocks, which ideally simulate all the possible corner cases.
Alternatively, you can even configure test on integration level to be executed locally if you replace all dependencies to remote services by local service providers. 
A common example for this is to run the application locally on H2 instead of SAP HANA.

The following diagram illustrates the modular stack architecture and highlights the generic components:

<img src="./assets/modularized-architecture.png" width="600px">

You can recognize five different areas of the stack, which comprise components according to different tasks:

* The mandatory [application framework](#application-framework) defines the runtime basis of your application typically comprising a web server.
* [Protocol adapters](#protocol-adapters) map protocol-specific web events into [CQN](../cds/cqn) events for further processing.
* The resulting CQN-events are passed to [service providers](#service-providers) or the mandatory core runtime, which drives the processing of the event.
* The [CQN execution engine](#cqn-execution-engine) is capable of translating [CQN](../cds/cqn) statements into native statements of a data sink such as a persistence service or remote service.
* [Application features](#application-features) are optional application extensions, for instance to add multitenancy capabilities or a platform service integration.


### Application Framework { #application-framework}

Before starting the development of a new CAP-based application, an appropriate application framework to build on needs to be chosen. 
The architecture of the chosen framework not only has a strong impact on the structure of your project, but it also affects efforts for maintenance as well as support capabilities.
The framework provides the basis of your web application in terms of a runtime container in which your business code can be embedded and executed. 
This helps to separate your business logic from common tasks like processing HTTP/REST endpoints including basic web request handling.
Typically, a framework also provides you with a rich set of generic tools for recurring tasks like configuration, localization, or logging. 
In addition, some frameworks come with higher-level concepts like dependency injection or sophisticated testing infrastructure.

CAP Java positions [Spring](https://spring.io) or more precisely [Spring Boot](https://spring.io/projects/spring-boot) as the first choice application framework, which is seamlessly integrated. 
Spring comes as a rich set of industry-proven frameworks, libraries, and tools that greatly simplify custom development. 
Spring Boot also allows the creation of self-contained applications that are easy to configure and run.

As all other components in the different layers of the CAP Java stack are decoupled from the concrete application framework, thus you aren't obligated to build on Spring. 
In some scenarios, it might be even preferable to run the (web) service with minimal resource consumption or with smallest possible usage of open source dependencies. 
In this case, a solution based on plain Java Servlets could be favorable. 
Lastly, in case you want to run your application on a 3rd party application framework, you're free to bundle it with CAP modules and provide the glue code, which is necessary for integration.


### Protocol Adapters { #protocol-adapters}


The CAP runtime is based on an [event](../about/#events) driven approach. 
Generally, [Service](../about/#services) providers are the consumers of events, that means, they do the actual processing of events in [handlers](../guides/providing-services#event-handlers). 
During execution, services can send events to other service providers and consume the results. 
The native query language in CAP is [CQN](../cds/cqn), which is accepted by all services that deal with data query and manipulation. 
Inbound requests therefore need to be mapped to corresponding CQN events, which are sent to an accepting Application Service (see concept [details](../about/#querying)) afterwards. 
Mapping the ingress protocol to CQN essentially summarizes the task of protocol adapters depicted in the diagram. 
Most prominent example is the [OData V4](https://www.odata.org/documentation/) protocol adapter, which is fully supported by the CAP Java. 
Further HTTP-based protocols can be added in future, but often applications require specific protocols, most notably [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer) ones. 
Such application-specific protocols can easily be implemented by means of Spring RestControllers.

The modular architecture allows to add custom protocol adapters in a convenient manner, which can be plugged into the stack at runtime. 
Note that different endpoints can be served by different protocol adapters at the same time.


### Service Providers { #service-providers}

Services have different purposes. For instance, CDS model services provide an interface to work with persisted data of your [domain model](../about/#domain-modeling). 
Other services are rather technical, for example, hiding the consumption API of external services behind a generic interface. 
As described in CAPs [core concepts](../about/#services), services share the same generic provider interface and are implemented by event handlers. 
The service provider layer contains all generic services, which are auto-exposed by CAP Java according to the appropriate CDS model. 
In addition, technical services are offered such as the [Persistence Service](consumption-api#persistenceservice) or [Auditlog Service](auditlog#auditlog-service), which can be consumed in custom service handlers.

In case the generic handler implementation of a specific service doesn't match the requirements, you can extend or replace it with custom handler logic that fits your business needs. 
See section [Event Handlers](provisioning-api) for more details.


### CQN Execution Engine { #cqn-execution-engine}

The CQN execution engine is responsible for processing the passed CQN events and translating them to native statements that get executed in a target persistence service like SAP HANA, PostgreSQL or H2. 
CQN statements can be built conveniently in a [fluent API](./query-api). In the future, additional targets can be added to the list of supported outbound sources.


### Application Features { #application-features}

The CAP Java architecture allows **additional modules to be plugged in at runtime**. 
This plugin mechanism makes the architecture open for future extensions and allows context-based configuration. 
It also enables you to override standard behavior with custom-defined logic in all different layers. 
Custom [plugins](#building-plugins) are automatically loaded by the runtime and can bring CDS models, CDS services, adapters or just handlers for existing services.

::: info
Plugins are optional modules that adapt runtime behaviour.
:::

CAP Java makes use of the plugin technique itself to offer optional functionality. 
Examples are [SAP Event Mesh](./messaging-foundation) and [Audit logging](./auditlog) integration.
Find a full list of standard plugins in [Standard Modules](#standard-modules).

## Stack Configuration { #stack_configuration}

 As outlined in section [Modular Stack Architecture](#modular_architecture), the CAP Java runtime is highly flexible. 
 You can choose among modules prepared for different environments and in addition also include plugins which are optional extensions.
 Which set of modules and plugins is active at runtime is a matter of compile time and runtime configuration.

 At compile time, you can assemble modules from the different layers:
 * The [application framework](#application-framework)
 * One or more [protocol adapters](#protocol-adapters)
 * The core [service providers](#service-providers)
 * [Application features](#application-features) to optionally extend the application or adapt to a specific environment

### Module Dependencies

All CAP Java modules are built as [Maven](https://maven.apache.org/) artifacts and are available on [Apache Maven Central Repository](https://search.maven.org/search?q=com.sap.cds). 
They've `groupId` `com.sap.cds`.
Beside the Java libraries (Jars) reflecting the modularized functionality, the group also contains a "bill of materials" (BOM) pom named `cds-services-bom`, which is recommended especially for multi-project builds. 
It basically helps to control the dependency versions of the artifacts and should be declared in dependency management of the parent `pom`:

```xml
<properties>
	<cds.services.version>2.6.0</cds.services.version>
</properties>

<dependencyManagement>
	<dependencies>
		<dependency>
			<groupId>com.sap.cds</groupId>
			<artifactId>cds-services-bom</artifactId>
			<version>${cds.services.version}</version>
			<type>pom</type>
			<scope>import</scope>
		</dependency>
	</dependencies>
</dependencyManagement>
```

::: tip Keep Versions in Sync
Importing `cds-services-bom` into the `dependencyManagement` of your project ensures that versions of all CAP modules are in sync.
:::

The actual Maven dependencies specified in your `pom` need to cover all modules that are required to run the web application: 
- The application framework.
- At least one protocol adapter (in case of inbound requests).
- The CAP Java runtime.

The dependencies of a Spring Boot application with OData V4 endpoints could look like in the following example:
<!-- to XML code ? -->
```xml
<dependencies>
	<!-- Application framework -->
	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-framework-spring-boot</artifactId>
		<scope>runtime</scope>
	</dependency>

	<!-- Protocol adapter -->
	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-adapter-odata-v4</artifactId>
		<scope>runtime</scope>
	</dependency>

	<!-- CAP Java SDK -->
	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-services-api</artifactId>
	</dependency>
	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-services-impl</artifactId>
		<scope>runtime</scope>
	</dependency>
</dependencies>
```

::: tip API Modules w/o scope `dependency`
Only API modules without dependency scope should be added (they gain `compile` scope by default) such as `cds-services-api` or `cds4j-api`.
All other dependencies should have a dedicated scope, like `runtime` or `test` to prevent misuse.
:::

You are not obliged to choose one of the prepared application frameworks (identifiable by `artifactId` prefix `cds-framework`),
instead you can define your own application context if required.
Similarly, you're free to configure multiple adapters including custom implementations that map any specific web service protocol.

::: tip Recommended Application Framework
We highly recommended to configure `cds-framework-spring-boot` as application framework.
It provides you with a lot of [integration with CAP](./development/#spring-boot-integration) out of the box, as well as enhanced features, such as dependency injection and auto configuration.
:::

Additional application features (plugins) you want to use can be added as additional dependencies. 
The following is required to make your application multitenancy aware:

```xml
<dependencies>
	<!-- Features -->
	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-feature-mt</artifactId>
		<scope>runtime</scope>
	</dependency>
</dependencies>
```

Choosing a feature by adding the Maven dependency *at compile time* enables the application to make use of the feature *at runtime*. 
If a chosen feature misses the required environment at runtime, the feature won't be activated. 
Together with the fact that all features have a built-in default implementation ready for local usage, you can run the application locally with the same set of dependencies as for productive mode.
For instance, the authentication feature `cds-feature-hana` requires a valid `hana` binding in the environment. 
Hence, during local development without this binding, this feature gets deactivated and the stack falls back to default feature adapted for H2.

#### Standard Modules { #standard-modules }

CAP Java comes with a rich set of prepared modules for all different layers of the stack:

**Application Frameworks**:
* `cds-framework-spring-boot`:  Makes your application a Spring Boot application.
* `cds-framework-plain`:  Adds support to run as plain Java Servlet-based application.

**Protocol adapters**:
* `cds-adapter-odata-v4`:  Auto-exposes Application Services as OData V4 endpoints.
* `cds-adapter-odata-v2`:  Auto-exposes Application Services as OData V2 endpoints.

**Core runtime**:
* `cds-adapter-api`:  Generic protocol adapter interface to be implemented by customer adapters.
* `cds-services-api`:  Interface of the CAP Java SDK. Custom handler or adapter code needs to compile against.
* `cds-services-impl`:  Implementation of the core CAP Java runtime (**mandatory**).

**Application plugins**:
* `cds-feature-cloudfoundry`:  Makes your application aware of SAP BTP, Cloud Foundry environment.
* `cds-feature-k8s`: [Service binding support for SAP BTP, Kyma Runtime](./development/#kubernetes-service-bindings).
* `cds-feature-jdbc`: Consuming JDBC persistences using the CDS4j JDBC runtime.
* `cds-feature-hana`:  Makes your application aware of SAP HANA data sources.
* `cds-feature-postgresql`: Makes your application aware of PostgreSQL data sources.
* `cds-feature-xsuaa`:  Adds [XSUAA](https://github.com/SAP/cloud-security-xsuaa-integration)-based authentication to your application.
* `cds-feature-identity`: Adds [Identity Services](https://github.com/SAP/cloud-security-xsuaa-integration) integration covering IAS to your application.
* `cds-feature-mt`:  Makes your application multitenant aware.
* `cds-feature-enterprise-messaging`:  Connects your application to SAP Event Mesh.
* `cds-feature-kafka`: Benefit from intra-application messaging with Apache Kafka.
* `cds-feature-remote-odata`: Adds [Remote Service](remote-services#remote-services) support.
* `cds-feature-auditlog-v2`: Provides out of the box integration with SAP BTP Auditlog Service V2.
* `cds-integration-cloud-sdk`: Allows smooth integration with Cloud SDK to connect with remote REST-based services.

::: tip
`cds-feature-cloudfoundry` and `cds-feature-k8s` can be combined to create binaries that support both environments.
:::

### Starter Bundles

To simplify the configuration on basis of Maven dependencies, the CAP Java comes with several starter bundles that help to set up your configuration for most common use cases quickly:

* `cds-starter-cloudfoundry`: Bundles features to make your application production-ready for SAP BTP, Cloud Foundry environment. It comprises XSUAA authentication, SAP HANA persistence, Cloud Foundry environment for SAP BTP, and multitenancy support.
* `cds-starter-k8s`: Bundles features to make your application production-ready for SAP BTP, Kyma/K8s environment. It comprises XSUAA authentication, SAP HANA persistence, Kyma/K8s environment for SAP BTP, and multitenancy support.
* `cds-starter-spring-boot`: Bundles all dependencies necessary to set up a web-application based on Spring Boot. No protocol adapter is chosen.

Starter bundle `cds-starter-spring-boot` can be combined with any of the other bundles.

An example of a CAP application with OData V4 on Cloud Foundry environment:
```xml
<dependencies>
		<dependency>
			<groupId>com.sap.cds</groupId>
			<artifactId>cds-starter-spring-boot</artifactId>
		</dependency>

		<dependency>
			<groupId>com.sap.cds</groupId>
			<artifactId>cds-adapter-odata-v4</artifactId>
			<scope>runtime</scope>
		</dependency>

		<dependency>
			<groupId>com.sap.cds</groupId>
			<artifactId>cds-starter-cloudfoundry</artifactId>
			<scope>runtime</scope>
		</dependency>
</dependencies>
```


## Generating Projects with Maven

Use the following command line to create a project from scratch with the CDS Maven archetype:

::: code-group
```sh [Mac/Linux]
mvn archetype:generate -DarchetypeArtifactId=cds-services-archetype -DarchetypeGroupId=com.sap.cds -DarchetypeVersion=RELEASE
```

```cmd [Windows]
mvn archetype:generate -DarchetypeArtifactId=cds-services-archetype -DarchetypeGroupId=com.sap.cds -DarchetypeVersion=RELEASE
```

```powershell [Powershell]
mvn archetype:generate `-DarchetypeArtifactId=cds-services-archetype `-DarchetypeGroupId=com.sap.cds `-DarchetypeVersion=RELEASE
```
:::

<div id="release-sap" />

It supports the following command-line options:

| Option | Description |
| -- | -- |
| `-DincludeModel=true` | Adds a minimalistic sample CDS model to the project |
| `-DincludeIntegrationTest=true` | Adds an integration test module to the project |
| `-DodataVersion=[v2\|v4]` | Specify which protocol adapter is activated by default |
| `-DtargetPlatform=cloudfoundry` | Adds CloudFoundry target platform support to the project |
| `-DinMemoryDatabase=[h2\|sqlite]` | Specify which in-memory database is used for local testing. If not specified, the default value is `h2`. |
| `-DjdkVersion=[17\|21]` | Specifies the target JDK version. If not specified, the default value is `17`. |


## Building Projects with Maven

You can build and run your application by means of the following Maven command:

```sh
mvn spring-boot:run
```


### CDS Maven Plugin { #cds-maven-plugin}

CDS Maven plugin provides several goals to perform CDS-related build steps.
For instance, the CDS model needs to be compiled to a CSN file which requires a Node.js runtime with module `@sap/cds-dk`.

It can be used in CAP Java projects to perform the following build tasks:

- Install Node.js in the specified version
- Install the CDS Development Kit `@sap/cds-dk` with a specified version
- Perform arbitrary CDS commands on a CAP Java project
- Generate Java classes for type-safe access
- Clean a CAP Java project from artifacts of the previous build

Since CAP Java 1.7.0, that CDS Maven Archetype sets up projects to leverage the CDS Maven plugin to perform the previous mentioned build tasks. 
To have an example on how you can modify a project generated with a previous version of the CDS Maven Archetype, see [this commit](https://github.com/SAP-samples/cloud-cap-samples-java/commit/ceb47b52b1e30c9a3f6e0ea29e207a3dad3c0190).

See [CDS Maven Plugin documentation](../assets/cds-maven-plugin-site/plugin-info.html){target="_blank"} for more details.

::: tip
Use the _.cdsrc.json_ file to add project specific configuration of `@sap/cds-dk` in case defaults are not appropriate.
:::

[Learn more about configuration and `cds.env`](../../node.js/cds-env){.learn-more}


### Using a Local cds-dk

By default, the build is configured to download a Node.js runtime and the `@sap/cds-dk` tools and install them locally within the project.
The `install-cdsdk` goal requires a version of `@sap/cds-dk`, which [needs to be provided explicitly](../../releases/archive/2022/oct22#important-changes-in-java) in the configuration. With this, you can ensure that the build is fully reproducible.
You can provide this version by adding the following property to the `properties` section in your `pom.xml`:

```xml
<properties>
    ...
    <cds.install-cdsdk.version>FIXED VERSION</cds.install-cdsdk.version>
</properties>
```

::: warning
Make sure to regularly update `@sap/cds-dk` according to [our guidance](../../releases/schedule). 

For multitenant applications, ensure that the `@sap/cds-dk` version in the sidecar is in sync.
:::

#### Maintaining cds-dk

By default, the goal `install-cdsdk` of the `cds-maven-plugin` skips the installation of the `@sap/cds-dk`, if the `@sap/cds-dk` is already installed. 
To update the `@sap/cds-dk` version in your application project do the following:

1. Specify a newer version of `@sap/cds-dk` in your *pom.xml* file.
2. Execute `mvn spring-boot:run` with an additional property `-Dcds.install-cdsdk.force=true`, to force the installation of a **`@sap/cds-dk`** in the configured version.

    ```sh
    mvn spring-boot:run -Dcds.install-cdsdk.force=true
    ```

::: tip _Recommendation_ <!--  -->
This should be done at least with every **major update** of `@sap/cds-dk`.
:::

<div id="xmake-troubleshooting" />

### Using a Global cds-dk

By default, the build is configured to download a Node.js runtime and the `@sap/cds-dk` tools and install them locally within the project.
This step makes the build self-contained, but the build also takes more time. You can omit these steps and speed up the Maven build, using the Maven profile `cdsdk-global`.

Prerequisites:
* `@sap/cds-dk` is [globally installed](../../get-started/jumpstart#setup).
* Node.js installation is available in current *PATH* environment.

If these prerequisites are met, you can use the profile `cdsdk-global` by executing:

```sh
mvn spring-boot:run -P cdsdk-global
```

