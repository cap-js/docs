---
synopsis: >
  Provides an overview of the different mechanisms that can be used to build plugins or extensions for CAP Java
status: released
---

# Extending CAP Java 

<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>

{{ $frontmatter.synopsis }}


<!-- #### Content -->
<!--- % include _chapters toc="2,3" %} -->

## Different use cases

Especially when working with larger projects that may consists of many individual CAP Java applications or when building platform services that need to be integrated with CAP applications there is the requirement to extend CAP Java with custom, yet reusable code. In the following sections the different extension points and mechanisms will be explained.

## Sharing reuasable CDS models via Maven artifacts

Prior to the CAP Java 2.2 release CDS definitions had to be shared as node.js modules, also for Java projects. 

Starting with the 2.2 release CDS models, CSV import data and i18n files can now be shared through Maven dependencies in addition to npm packages. This means you can now provide CDS models, CSV files, i18n files and Java code (for example, event handlers) in a single Maven dependency.

Your models need to be placed in the `resources/cds` folder of the reuse package under a unique module directory (for example, leveraging group ID and artifact ID): `src/main/resources/cds/com.sap.capire/bookshop/`.

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

This technique can be used indepently or together with one or more of the techniques described on this page.

### Event Handlers for custom types and annotations

Besides extending the capabilities for in- and outbound requests it is also possible to extend the behaviour of event and request handling *inside* the CAP Java runtime. Meaning that you can define custom handlers that react on model characteristics (common types or annotations) or also on entity values e.g. validations. Inside your reuse module you can define a custom event handler and and a registration hook as plain Java code. Once this module is addded to any CAP Java application as a dependency the contained event handler code will be active automatically.

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

The shown handler code is registered for any entity type on any [application service](link to providing services section). Dependending on the use case the target scope could narrowed to specific entities and/or services. The handler registration applies to the same rules as custom handlers that are directly packaged with a CAP Java application.

The real difference to your typical event handler in your application code is the actual handler reigstration code. Although you could use the same `@Componenent` Spring Framework mechanism this is not recommendable because your handler code would then be dependent on Spring and not only on CAP Java. Your code would need to maintain it's own versioned dependency to the Spring Framework or Spring Boot and would need to react to changes in the given frameworks.

So, in order to have a framework independent handler registration the `` interface needs to be implemented like this:

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

At runtime, CAP Java uses the [`ServiceLoader`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/ServiceLoader.html) mechanism to load all implementations of the `CdsRuntimeConfiguration` interface from the application's ClassPath. In order to qualify as a contributor for a given ServiceLoader-enabled interface we need to place plain text file named like the fully qualified name of the interface in the directory `src/main/resources/META-INF/services` of our reuse model containing the name of the implementing class(es). For the above implemented `CdsRuntimeConfiguration` we need to create a file `src/main/resources/META-INF/services/CdsRuntimeConfiguration` with the following content:

```
com.sap.example.cds.SampleHandlerRuntimeConfiguration
```

With this code we instrument the CAP Java's ServiceLoader for `CdsRuntimeConfiguration` to load our new, generic EventHandler for all read events on all entities of all services. For realistic usecases the handler configuration can be more concise, of course.

[Learn more about event handling in our EventHandler documentation](https://cap.cloud.sap/docs/java/provisioning-api){.learn-more}

A complete end-to-end example for reusable event handlers can be found in this [blog post](https://blogs.sap.com/2023/05/16/how-to-build-reusable-plugin-components-for-cap-java-applications/).

### Protocol Adapter

In CAP Java, the protocol adapter is the mechanism to implement inbound communication from other service to the CAP service in development. The task of a protocol adapter is to translate any incoming requests (protocol) to CQL statements that then can be executed on local services. CAP Java comes with 2 OData protocol adapters (OData V2 and V4) but can be extended with custom implementations. In this section we'll have a deeper look on how such a protocol adapter can be built and registered with the CAP Java runtime.

Usually, a protocol adapter comes in 2 parts. The adapter itself (in most cases an implementation of the HttpServlet interface) and a factory class that creates an instance of the adapter as well as providing information about the paths to which the protocol adapter (the servlet) needs to be registered.



(add details about the interfaces that can be implemented)


### Putting it all together

So, there are various ways to extend the CAP Java framework. You can use one or more of the mentioned techniques and combine them in one or more Maven modules. This totally depends on your needs and requirements. 