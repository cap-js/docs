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

Prior to the CAP Java 2.2 release CDS definitions had to be shared as node.js modules also for Java projects. 

Starting with the 2.2 release CDS models, CSV import data and i18n files can now be shared through Maven dependencies in addition to npm packages. This means you can now provide CDS models, CSV files, i18n files and Java code (for example, event handlers) in a single Maven dependency.

Your models need to be placed in the `resources/cds` folder of the reuse package under a unique module directory (for example, leveraging group ID and artifact ID): `src/main/resources/cds/com.sap.capire/bookshop/`.

Projects wanting to import the content simply add a Maven dependency to the reuse package to their `pom.xml` in the <dependencies> section.

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

### Protocol Adapter

In CAP Java the protocol adapter is the mechanism to implement inbound communication from other service to the CAP service in development. The task of a protocol adapter is to develop any

### Remote Service Adapter

### Handlers for custom types and annotations

