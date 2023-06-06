---
synopsis: >
  How to start a new CAP Java project and how to run it locally.
notebook: true
notebooklanguages: java
notebooktitle: Getting Started
redirect_from: java/overview
status: released
---
<!--- Migrated: @external/java/010-Getting-Started/0-index.md -> @external/java/getting-started.md -->

# Getting Started

<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>

<div v-html="$frontmatter?.synopsis" />
<!--- % include links.md %} -->

## Introduction
<!--Used as link target from Help Portal: https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/9186ed9ab00842e1a31309ff1be38792.html -->

The CAP Java SDK enables developing CAP applications in Java. While the [SAP Business Application Studio](https://help.sap.com/products/SAP%20Business%20Application%20Studio/9d1db9835307451daa8c930fbd9ab264/84be8d91b3804ab5b0581551d99ed24c.html) provides excellent support to develop CAP Java applications, you can also develop locally with your tool of choice, for example Eclipse or Visual Studio Code.

The CAP Java SDK supports lean application design by its modular architecture, that means you pick the required features and add them to your application dependencies on demand.

It enables local development by supporting in-memory or file-based SQLite databases. At the same time, the CAP Java SDK enables switching to a productive environment, using, for example, SAP HANA as a database, easily by simply switching the application deployment configuration.

If you use Spring Boot, you find yourself directly at home when using the CAP Java SDK, as the framework integrates with Spring Boot features like transaction handling, auto-wiring and test support. While the CAP Java SDK is framework agnostic, it's also possible to develop plain Java applications or even integrate with other frameworks.

The CAP Java SDK comes with an OData V4 protocol adapter, but it's openly designed. You can add more protocol adapters in the future or provide even custom protocol adapters by the application.

It supports SAP BTP features like authentication and authorization based on XSUAA tokens. But you aren't locked in to SAP BTP using a CAP Java application.

<span id="inintro" />

Excited? The following sections describe how to set up a development environment to get you started.

## Setting Up Local Development { #local}
<!--Used as link target from Help Portal: https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/9186ed9ab00842e1a31309ff1be38792.html -->


This section describes the prerequisites and tools to build a CAP application locally.

1. Install the CDS tools (`cds-dk)` by following the steps in section *[Getting Started > Local Set Up](../get-started/jumpstart#setup)*.

2. Install a Java VM. At least, Java 8 is required. For example, [download](https://github.com/SAP/SapMachine/releases/latest) and [install](https://github.com/SAP/SapMachine/wiki/Installation) SapMachine 17.

3. [Install Apache Maven](https://maven.apache.org/download.cgi) (at least version 3.5.0 is required).

<span id="maven-sap" />

4. Execute the following commands on the command line to check whether the installed tools are set up correctly:

    ```sh
    cds --version
    java --version
    mvn --version
    ```
::: tip
For a preconfigured environment, use [SAP Business Application Studio](../tools/#bastudio), which comes with all of the required tools preinstalled.
:::

## Starting a New Project { #new-project}
<!--Used as link target from Help Portal: https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/9186ed9ab00842e1a31309ff1be38792.html -->

Take the following steps to set up a new CAP Java application based on Spring Boot from scratch. As a prerequisite, you've set up your [development environment](#local).

### Run the CAP Java Maven Archetype

Use the [CAP Java Maven archetype](./development/#the-maven-archetype) to bootstrap a new CAP Java project:

```sh
mvn archetype:generate -DarchetypeArtifactId="cds-services-archetype" -DarchetypeGroupId="com.sap.cds" -DarchetypeVersion="RELEASE" -DinteractiveMode=true
```

<div id="release-sap" />

When prompted, specify the group ID and artifact ID of your application. The artifact ID also specifies the name of your projects root folder that is generated in your current working directory. For other values prompted, it's enough to simply confirm the default values.

Alternatively, you can use the CDS tools to bootstrap a Java project:

```sh
cds init <PROJECT-ROOT> --add java
```
::: tip
You can call `cds help init` for more information on the available options.
:::


### Add a Sample CDS Model

You can use the [CDS Maven plugin](./development/#cds-maven-plugin) to add a sample CDS model after creating your project. Navigate to the root folder of your CAP Java project and execute the following Maven command:

```sh
mvn com.sap.cds:cds-maven-plugin:addSample
```

### Add CloudFoundry target platform

Following the "[Grow As You Go](../get-started/grow-as-you-go)" principle, the generated CAP Java project doesn't contain support for Cloud Foundry as the target platform. To enhance your project with dependencies required for Cloud Foundry, execute the goal `addTargetPlatform` of the [CDS Maven plugin](./assets/cds-maven-plugin-site/addTargetPlatform-mojo.html){target="_blank"} using the following command:

```sh
mvn com.sap.cds:cds-maven-plugin:addTargetPlatform -DtargetPlatform=cloudfoundry
```

This commands adds the following dependency to the pom.xml:

```xml
<dependency>
	<groupId>com.sap.cds</groupId>
	<artifactId>cds-starter-cloudfoundry</artifactId>
</dependency>
```
::: tip
CAP Java also provides a starter bundle for SAP BTP Kyma environment. See [CAP Starter Bundles](./architecture#starter-bundles) for more details.
:::

### Project Layout

The generated project has the following folder structure:

```
<PROJECT-ROOT>/
|-- db/
    `-- data-model.cds
`-- srv/
    |-- cat-service.cds
    |-- src/main/java/
    |-- src/gen/java/
    `-- node_modules/
```

The generated folders have the following content:

| Folder | Description |
| --- | --- |
| *db* | Contains content related to your database. A simple CDS domain model is located in the file _data-model.cds_. |
 | *srv* | Contains the CDS service definitions and Java back-end code and the sample service model  _cat-service.cds_. |
| *srv/src/main/java* | Contains Java application logic. |
| *srv/src/gen/java* | Contains the compiled CDS model and generated [accessor interfaces for typed access](./data#typed-access). |
| *node_modules* | Generated when starting the build, containing the dependencies for the CDS tools (unless you specify `-Dcdsdk-global` [when starting the build](#build-and-run)). |


<!-- TODO: Where to put this to not distract the Java Developer??

### Using the CDS Tools

For a quick start, you can use `cds init` to bootstrap a CAP Java application based on Spring Boot. Run the following command:

```sh
cds init <PROJECT-ROOT> --add java
```

You can also specify the package name through parameter `--java:package`. Default for the package name is: `org.<PROJECT-ROOT>`.

```sh
cds init <PROJECT-ROOT> --add java --java:package <java package name>
```

The `artifactId` is set to `<PROJECT-ROOT>` and the `groupId` to `customer`.
-->

### Add an Integration Test Module (Optional)

Optionally, you can use the [CDS Maven plugin](./development/#cds-maven-plugin) to enhance your CAP Java application with an additional Maven module to perform integration tests. To add such a module, go into the root folder of your CAP Java project and execute the following Maven command:

```sh
mvn com.sap.cds:cds-maven-plugin:addIntegrationTest
```

This command also creates a new folder *integration-tests/src/test/java*, which contains integration test classes:
```
<PROJECT-ROOT>/
`-- integration-tests/
    `-- src/test/java/
```

| Folder | Description  |
| -- | -- |
| *integration-tests/src/test/java* | Contains integration test classes. |

<span id="beforebuildnrun" />

### Build and Run

To build and run the generated project from the command line, execute:

```sh
cd <PROJECT-ROOT>
mvn spring-boot:run
```
::: tip
To test whether the started application is up and running, open [http://localhost:8080](http://localhost:8080) in your browser.
:::

## Using Eclipse { #eclipse}
<!--Used as link target from Help Portal: https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/9186ed9ab00842e1a31309ff1be38792.html -->

### Install Eclipse

Install the [Eclipse IDE for Enterprise Java developers](https://www.eclipse.org/downloads/packages/release/2020-03/r/eclipse-ide-enterprise-java-developers-includes-incubating-components).


### Add *Spring Tools 4*

Install the [*Spring Tools 4*](https://spring.io/tools) Eclipse plugin, that makes development of Spring applications more convenient. From the Eclipse Marketplace (*Help > Eclipse Marketplace...*), search and install *Spring Tools 4*.

### Add the *SAP Cloud Business Application Tools for Eclipse*

Install the Eclipse plugin called _SAP Cloud Business Application Tools for Eclipse_ that supports convenient editing of CDS files.

1. In Eclipse open *Help > Install New Software...*.

1. From [SAP Development Tools > Getting Started with the Eclipse Tools for SAP Cloud Application Programming Model](https://tools.hana.ondemand.com/#cloud-eclipsecds), add the URL of the tools update site for your Eclipse release.

1. Select *SAP Cloud Business Application Tools* > *SAP Cloud Business Application Tools for Eclipse*.

1. Click *Next* and *Finish*, accept the license agreement and warning about unsigned content, restart Eclipse.

<div id="eclipse-sap" />

### Import the Project

1. Select *File > Import... > Existing Maven Projects*.

2. Select your `PROJECT-ROOT` folder and click *Go*. Finally, select the project that was found.

<span id="inimportproject" />

> To not be distracted by CDS tools-specific folders in Eclipse, you can define resource filters. Open the context menu on the project's root folder and select "Properties". Go to **Resource > Resource Filters** and exclude folders with the name `node_modules`.



### Compile the Project

1. Right-click on the `pom.xml` file in the project root folder and select *Run as > Maven build*.

2. Enter the string `clean install` to the field labeled with *Goals* and click *Run*. This step compiles your CDS artifacts. Repeat this step once your CDS model changes.

3. Right-click on the root project and select *Maven > Update Project ...*. Make sure *Refresh workspace resources from local filesystem* is selected and choose *Ok*.

### Run and Test the Application

1. Right-click on the project root in the *Package Explorer* and select *Run as > Spring Boot App*.

2. Call the application in your browser at [http://localhost:8080/](http://localhost:8080).

## Sample Application { #sample}

Find [here](https://github.com/SAP-samples/cloud-cap-samples-java) the bookshop sample application based on CAP Java.
