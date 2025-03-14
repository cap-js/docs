---
synopsis: >
  This section describes various options how to run CAP Java applications locally

status: released
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/9186ed9ab00842e1a31309ff1be38792.html
---

# Running Applications
<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>

## Spring Boot Devtools
You can speed up your development turnaround by adding the [Spring Boot Devtools](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools) dependency to your CAP Java application. Just add this dependency to the `pom.xml` of your `srv` module:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
</dependency>
```

Once this is added, you can use the restart capabilities of the Spring Boot Devtools while developing your application in your favorite Java IDE. Any change triggers an automatic application context reload without the need to manually restart the complete application. Besides being a lot faster than a complete restart this also eliminates manual steps. The application context reload is triggered by any file change on the application's classpath:

* Java classes (for example, custom handlers)
* Anything inside src/main/resources
  * Configuration files (for example, _application.yaml_)
  * Artifacts generated from CDS (schema.sql, CSN, EDMX)
  * Any other static resource

::: warning Restart for changed Java classes
Spring Boot Devtools only detects changes to .class files. You need to enable the *automatic build* feature in your IDE which detects source file changes and rebuilds the .class file. If not, you have to manually rebuild your project to restart your CAP Java application.
:::

### CDS Build

The Spring Boot Devtools have no knowledge of any CDS tooling or the CAP Java runtime. Thus, they can't trigger a CDS build if there are changes in the CDS source files. For more information, please check the [Local Development Support](#local-development-support) section.

::: tip
CDS builds in particular change numerous resources in your project. To have a smooth experience, define a [trigger file](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools.restart.triggerfile) and [use `auto-build` goal](#cds-auto-build) of the CDS Maven plugin started from the command line.
:::


## Local Development Support

### Use `cds` Prefix Everywhere

To use the `cds` prefix of the `cds-maven-plugin` from everywhere, add the plugin group `com.sap.cds` to your local `~/.m2/settings.xml`:

```xml
<pluginGroups>
    <pluginGroup>com.sap.cds</pluginGroup>
</pluginGroups>
```

This uses the [Maven plugin prefix resolution](https://maven.apache.org/guides/introduction/introduction-to-plugin-prefix-mapping.html) feature. This Maven feature allows you to use only the `cds` prefix of the `cds-maven-plugin` to execute goals of this plugin. For example, instead of `mvn com.sap.cds:cds-maven-plugin:watch` you can use the shorter variant `mvn cds:watch` to run the `watch` goal of the `cds-maven-plugin`.

### CDS Watch
In addition to the previously mentioned build tasks, the CDS Maven plugin can also support the local development of your CAP Java application. During development, you often have to perform the same steps to test the changes in the CDS model:

1. Modify your CDS model.
1. Build and run your application.
1. Test your changes.

To automate and accelerate these steps, the `cds-maven-plugin` offers the goal `watch`, which can be executed from the command line by using Maven:

```sh
mvn cds:watch
```
:::details Other options if you've not configured the plugin group
```sh
# from your root directory
mvn com.sap.cds:cds-maven-plugin:watch
# or your srv/ folder
cd srv
mvn cds:watch
```
:::

It builds and starts the application and looks for changes in the CDS model. If you change the CDS model, these are recognized and a restart of the application is initiated to make the changes effective.

The `watch` goal uses the `spring-boot-maven-plugin` internally to start the application with the goal `run` (this also includes a CDS build). Therefore, it's required that the application is a Spring Boot application and that you execute the `watch` goal within your service module folder.
When you add the [Spring Boot Devtools](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools) to your project, the `watch` goal can take advantage of the reload mechanism. In case your application doesn't use the Spring Boot Devtools the `watch` goal performs a complete restart of the Spring Boot application after CDS model changes. As the application context reload is always faster than a complete restart the approach using the Spring Boot Devtools is the preferred approach.

::: warning
On Windows, the `watch` goal only works if the Spring Boot Devtools are enabled.
:::

### CDS Auto-Build

If you want to have the comfort of an automated CDS build like with the `watch` goal but want to control your CAP Java application from within the IDE, you can use the `auto-build` goal. This goal reacts on any CDS file change and performs a rebuild of your applications's CDS model. However, no CAP Java application is started by the goal. This doesn't depend on Spring Boot Devtools support.

::: tip
If the Spring Boot Devtools configuration of your CAP Java application defines a [trigger file](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools.restart.triggerfile), the `auto-build` can detect this and touch the trigger file in case of any file change. The same applies to the `watch` goal.
:::

### Multitenant Applications

With the streamlined MTX, you can run your multitenant application locally along with the MTX sidecar and use SQLite as the database.
See [the _Multitenancy_ guide](../../guides/multitenancy/#test-locally) for more information.


## Debugging

You can debug both local and remote Java applications.

- For local applications, it's best to start the application using the integrated debugger of your [preferred IDE](../../tools/cds-editors).
- Especially for remote applications, we recommend [`cds debug`](../../tools/cds-cli#java-applications) to turn on debugging.
