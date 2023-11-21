---
synopsis: >
  A collection of different mechanisms that can be used to build plugins for CAP Java. 
status: released
---

# Building CAP Java Plugins

<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>

{{ $frontmatter.synopsis }}


<!-- #### Content -->
<!--- % include _chapters toc="2,3" %} -->

Especially when working with larger projects that may consists of many individual CAP Java applications or when building platform services that need to be integrated with CAP applications there is the requirement to extend CAP Java with custom, yet reusable code. 

In the following sections the different extension points and mechanisms will be explained.

## Sharing Reusable CDS Models via Maven artifacts

Prior to the CAP Java 2.2 release CDS definitions had to be shared as node.js modules, also for Java projects. 

Starting with the 2.2 release CDS models, CSV import data and i18n files can now be shared through Maven dependencies in addition to npm packages. This means you can now provide CDS models, CSV files, i18n files and Java code (for example, event handlers) in a single Maven dependency.

### Create the Reuse Model in a New Maven Artifact

Simply create a plain Maven Java project and place your CDS models in the `main/resources/cds` folder of the reuse package under a unique module directory (for example, leveraging group ID and artifact ID): `src/main/resources/cds/com.sap.capire/bookshop/`. With `com.sap.capire` being the group ID and `bookshop` being the artifact ID.

### Reference the Reuse Model in an Existing CAP Java Project

Projects wanting to import the content simply add a Maven dependency to the reuse package to their `pom.xml` in the `<dependencies>` section.

```xml

<dependency>
  <groupId>com.sap.capire</groupId>
  <artifactId>bookshop</artifactId>
  <version>1.0.0</version>
</dependency>
```

Additionally the new `resolve` goal from the CDS Maven Plugin needs to be added, to extract the models into the `target/cds/` folder of the Maven project, in order to make them available to the CDS Compiler.

```xml
<plugin>
  <groupId>com.sap.cds</groupId>
  <artifactId>cds-maven-plugin</artifactId>
  <version>${cds.services.version}</version>
  <executions>
    ...
    <execution>
      <id>cds.resolve</id>
      <goals>
        <goal>resolve</goal> // [!code focus]
      </goals>
    </execution>
    ...
  </executions>
</plugin>
```

In CDS files the reuse models can then be referred to using the standard `using` directive:

```cds
using { CatalogService } from 'com.sap.capire/bookshop';
```

> Note that [CDS editor](../tools/#cds-editor) does not yet support this new location and hence shows an error marker for this line. This will be fixed soon.

[Learn more about providing and using reuse packages.](../guides/extensibility/composition){.learn-more}

This technique can be used independently or together with one or more of the techniques described on this page.

## Event Handlers for custom types and annotations

Besides extending the capabilities for inbound requests it is also possible to extend the behaviour of event handling during request handling of the CAP Java runtime. Meaning that you can define custom handlers that react on model characteristics (common types or annotations) or also on entity values e.g. validations.

Inside your reuse module you can define a custom event handler and a registration hook as plain Java code. Once this module is added to any CAP Java application as a dependency the contained event handler code will be active automatically.

Such an event handler basically looks like any other CAP Java event handler. Take this one as an example:

```java
@ServiceName(value = "*", type = ApplicationService.class)
public class SampleHandler implements EventHandler {

    @After
    public void handleSample(CdsReadEventContext context) {
      // any custom Java code using the event context and CQL APIs
    }
}
```

The shown handler code is registered for any entity type on any [ApplicationService](../guides/providing-services). Dependending on the use case the target scope could narrowed to specific entities and/or services. The handler registration applies to the same rules as custom handlers that are directly packaged with a CAP Java application.

The real difference to your typical event handler in your application code is the actual handler registration code. Although you could use the same `@Componenent` Spring Framework mechanism this is not recommendable because your handler code would then be dependent on Spring and not only on CAP Java. Your code would need to maintain it's own versioned dependency to the Spring Framework or Spring Boot and would need to react to changes in the given frameworks.

So, in order to have a framework independent handler registration the `CdsRuntimeConfiguration` interface needs to be implemented like this:

```java
package com.sap.example.cds;

import com.sap.cds.services.runtime.CdsRuntimeConfiguration;
import com.sap.cds.services.runtime.CdsRuntimeConfigurer;

public class SampleHandlerRuntimeConfiguration implements CdsRuntimeConfiguration {

	@Override
	public void eventHandlers(CdsRuntimeConfigurer configurer) {
		configurer.eventHandler(new SampleHandler());
	}

}
```
### Load Plugin Code via ServiceLoaders {#service-loader}
At runtime, CAP Java uses the [`ServiceLoader`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/ServiceLoader.html) mechanism to load all implementations of the `CdsRuntimeConfiguration` interface from the application's ClassPath. In order to qualify as a contributor for a given ServiceLoader-enabled interface we need to place plain text file named like the fully qualified name of the interface in the directory `src/main/resources/META-INF/services` of our reuse model containing the name of the implementing class(es). For the above implemented `CdsRuntimeConfiguration` we need to create a file `src/main/resources/META-INF/services/CdsRuntimeConfiguration` with the following content:

```txt
com.sap.example.cds.SampleHandlerRuntimeConfiguration
```

With this code we instrument the CAP Java's ServiceLoader for `CdsRuntimeConfiguration` to load our new, generic EventHandler for all read events on all entities of all services. For realistic usecases the handler configuration can be more concise, of course.



[Learn more about event handling in our EventHandler documentation](provisioning-api){.learn-more}

A complete end-to-end example for reusable event handlers can be found in this [blog post](https://blogs.sap.com/2023/05/16/how-to-build-reusable-plugin-components-for-cap-java-applications/).

## Custom Protocol Adapters

In CAP Java, the protocol adapter is the mechanism to implement inbound communication (another service or the UI) to the CAP service in development. The task of a protocol adapter is to translate any incoming requests of a defined protocol to CQL statements that then can be executed on locally defined CDS services. CAP Java comes with 3 protocol adapters (OData V2 and V4, and HCQL) but can be extended with custom implementations. In this section we'll have a deeper look on how such a protocol adapter can be built and registered with the CAP Java runtime.

Usually, a protocol adapter comes in 2 parts. The adapter itself (in most cases an extension of the HttpServlet abstract class) and a factory class that creates an instance of the adapter as well as providing information about the paths to which the protocol adapter (the servlet) needs to be registered. The factory interface is called `ServletAdapterFactory` and implementations of that factory will be loaded with the same [`ServiceLoader` approach as described above](#service-loader) in the event handler section.

This is an example implementation of the `ServletAdapterFactory`:

```java
public class SampleAdapterFactory implements ServletAdapterFactory, CdsRuntimeAware {

  /*
   * a short key identifying the protocol that's being served
   * by the new protocol adapter e.g. odata-v4, hcql, ..
   */

	static final String PROTOCOL_KEY = "protocol-key"; 

	private CdsRuntime runtime;

	@Override
	public void setCdsRuntime(CdsRuntime runtime) {

    /*
     * In case the protocol adapter needs the CdsRuntime the
     * factory can implement CdsRuntimeAware and will be provided
     * with a CdsRuntime via this method. The create() method
     * below can then use the provided runtime for the protocol adapter.
     */
		this.runtime = runtime;
	}

	@Override
	public Object create() {
    // Create and return the protocol adapter
    return new SampleAdater(runtime);
	}

	@Override
	public boolean isEnabled() {
    // Determines if the protocol adapter is enabled
	}

	@Override
	public String getBasePath() {
    // Return the base path 
	}

	@Override
	public String[] getMappings() {
    /*
     * Return all paths to which the protocol adapter is going to
     * be mapped. Usually, this will be each CDS service
     * with either it's canonical or annotated path prefixed with
     * the base path of the protocol adapter (see above).
     */
		
	}

	@Override
	public UrlResourcePath getServletPath() {
		/*
     * Use the UrlResourcePathBuilder to build and return a UrlResourcePath
     * containing the basePath (see above) and all paths being registered
     * for the protocol key of the new protocol adapter.
     */
	}

}
```

With the factory in place we can start to build the actual protocol adapter. As mentioned before, most adapters will implement HTTP connectivity and will therefore be an extension of the Jakarta `HttpServlet` class. Based on the incoming request path the protocol adapter needs to determine the corresponding CDS `ApplicationService`. Parts of the request path together with potential request parameters (this depends on the protocol to be implemented) then need to be mapped to a CQL statement which is then executed on the previously selected CDS `ApplicationService`.

```java
public class SampleAdapter extends HttpServlet {

	private final CdsRuntime runtime;

	public CdsHcqlServlet(CdsRuntime runtime) {
		this.runtime = runtime;
        // see below for further details
	}

	@Override
	public void service(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // see below for further details
    }
}
```

As mentioned above, a protocol adapter maps incoming requests to CQL statements and executes them on the right [`ApplicationService`](https://cap.cloud.sap/docs/java/application-services) according to the `HttpServletRequest`'s request-path. In order to have all relevant `ApplicationServices` ready at runtime you can call `runtime.getServiceCatalog().getServices(ApplicationService.class)` in the adapter's constructor to load all `ApplicationServices` and then select the ones relevant for this protocol adapter and then have them ready (in e.g. a Map) for serving requests in `service()`.
     
When handling incoming requests at runtime, you need to extract the request path and parameters from the incoming HttpServletRequest. Then, you can use CQL API from the `cds4j-api` module to [create CQL](https://cap.cloud.sap/docs/java/query-api) corresponding to the extracted information. This statement then needs to be executed with [`ApplicationService.run()`](https://cap.cloud.sap/docs/java/query-execution). The returned result then needs to be mapped to the result format that is suitable for the protocol handled by the adapter. For REST it would be some canonical JSON serialization of the returned objects.

So, a REST request like

```http
GET /CatalogService/Books?id=100
```

would result in this CQL statement:

```java
CqnSelect select = Select.from("Books").byId(100);
```

The `CqnSelect` statement can then be executed with the right (previously selected) `ApplicationService` and then written to HttpServletResponse as a String serialization.

```java
String resposePayload = applicationService.run(select).toJson();
response.getWriter().write(responsePayload);
```

With that a first iteration of a working CAP Java protocol adapter would be complete. As a wrap-up, this would be the tasks that need to be implemented in the adapter:

1. Extract the request path and select the corresponding CDS `ApplicationService`.
2. Build a CQL statement based on the request path and parameters.
3. Execute the CQL statement on the selected service and write the result to the response.

On final comment on protocol adapters: even a very simple protocol adapter like sketched in this section enables full support of other CAP features like declarative security, i18n and of course custom as well as generic event handlers.

## Putting it all together

As we have learned in this guide there are various ways to extend the CAP Java framework. You can use one or more of the mentioned techniques and combine them in one or more Maven modules. This totally depends on your needs and requirements.

Most probably you to combine the *Event Handler with custom types and annotations* mechanism together with *Sharing reuasable CDS models via Maven artifacts* because the event handler mechanism might rely on shared CDS artifacts. The protocol adapters on the other hand are very generic and model-independent modules that should be packaged and distributed independently.