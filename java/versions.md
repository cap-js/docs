---
synopsis: >
  Learn in this chapter about CAP Java versions and their dependencies.
status: released
---

# Versions & Dependencies
<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>

{{ $frontmatter.synopsis }}


<!-- #### Content -->
<!--- % include _chapters toc="2,3" %} -->

<!-- ## [CDS Properties](properties/) {.toc-redirect} -->

<!-- [Learn more about CDS properties to configure the CAP Java SDK.](properties){.learn-more} -->

## Versions { #versions }

CAP Java is pretty much alinged with [Semantic Versioning Specification](https://semver.org).
Hence, the version identifier follows the pattern `MAJOR.MINOR.PATCH`:

- **Major versions** are delivered every year or even several years and might introduce [incompatible changes](../releases/schedule#cap-java) (e.g. `2.0.0`).
Upcoming major versions are announced early.

- **Minor versions** are delivered on a [monthly basis](/releases/schedule#minor) (e.g. `2.7.0` replacing `2.6.4`). 
New features are announced in [CAP Release notes](/releases/).

- **Patch versions** containing critical bugfixes are delivered [on demand](../releases/schedule#patch) (e.g. `2.7.1` replacing `2.7.0`). **Patches do not contain new features**.

Find detailed information about versions and release in the [CAP release schedule](../releases/schedule#cap-java).

::: warning
It is strongly recommended to **consume latest minor version on a monthly basis** to keep future migration efforts as small as possible.

Likewise, it is strongly recommended to **consume latest patch version as soon as possible** to recieve critical bug fixes.
:::

### Active Version { #active-version }

New features are developed and delivered in the [active codeline](../releases/schedule#active) of CAP Java only.
That means the currently active codeline recieves minor version updates as welll as patches.
A new major version opens a new active codeline and the previous one is put into maintenance mode.

### Maintenance Version { #maintenance-version }

In the [maintenance codeline](../releases/schedule#maintenance-status) of CAP Java, only patch versions are deliverd.
This version provides applications with a longer time horizon for migrating to a new major version.


<div id="milestones" />


## Maintain Dependencies { #dependencies }

### Minimum Versions

CAP Java uses various dependencies that are also used by the applications themselves. 
If the applications decide to manage the versions of these dependencies, it's helpful to know the minimum versions of these dependencies that CAP Java requires. 
The following table lists these minimum versions for various common dependencies, based on the latest release:

#### Active Version 2.x { #dependencies-version-2 }

| Dependency | Minimum Version | Recommended Version |
| --- | --- | --- |
| JDK | 17 | 21<sup>1</sup> |
| @sap/cds-dk | 6 | latest |
| @sap/cds-compiler | 3 | latest |
| Spring Boot | 3.0 | latest |
| XSUAA | 3.0 | latest |
| SAP Cloud SDK | 4.24 | latest |
| Java Logging | 3.7 | latest |

<sup>1</sup> When using the SAP Business Application Studio JDK 17 is recommended.

::: warning
The Cloud SDK BOM `sdk-bom` manages XSUAA until version 2.x, which isn't compatible with CAP Java 2.x.
You have two options:
* Replace `sdk-bom` with `sdk-modules-bom`, which [manages all Cloud SDK dependencies but not the transitive dependencies.](https://sap.github.io/cloud-sdk/docs/java/guides/manage-dependencies#the-sap-cloud-sdk-bill-of-material)
* Or, add [dependency management for XSUAA](https://github.com/SAP/cloud-security-services-integration-library#installation) before Cloud SDK's `sdk-bom`.
:::

#### Maintenance Version 1.34.x

| Dependency | Minimum Version | Recommended Version |
| --- | --- | --- |
| JDK | 8 | 17 |
| @sap/cds-dk | 4 | 6 |
| @sap/cds-compiler | 2 | 3 |
| Spring Boot | 2.7 | 2.7 |
| XSUAA | 2.13 | latest |
| SAP Cloud SDK | 4.10 | 4.29.0 |

### Consistent Versions

Some SDKs such as CAP Java or Cloud SDK provide a bunch of artifacts with a common version.
Mixing different versions of SDK artifacts often results in compiler errors or unpredictable runtime issues.

To help to keep client configuration consistent, SDKs usually provide bill of material (BOM) poms as optional maven dependency.

::: warning
It is strongly recommended to import availalbe BOM poms.
:::

Following example shows how BOM poms of `com.sap.cds`, `com.sap.cloud.sdk` and `com.sap.cloud.security` can be added to the project's parent `pom.xml`:

::: code-group
```xml [pom.xml]
<dependencyManagement>
	<dependencies>
		<!-- CDS SERVICES -->
		<dependency>
			<groupId>com.sap.cds</groupId>
			<artifactId>cds-services-bom</artifactId>
			<version>${cds.services.version}</version>
			<type>pom</type>
			<scope>import</scope>
		</dependency>

		<!-- CLOUD SDK -->
		<dependency>
			<groupId>com.sap.cloud.sdk</groupId>
			<artifactId>sdk-modules-bom</artifactId>
			<version>${cloud.sdk.version}</version>
			<type>pom</type>
			<scope>import</scope>
		</dependency>

		<!-- SAP SECURITY -->
		<dependency>
			<groupId>com.sap.cloud.security</groupId>
			<artifactId>java-bom</artifactId>
			<version>${xsuaa.version}</version>
			<type>pom</type>
			<scope>import</scope>
		</dependency>
	</dependencies>
</dependencyManagement>
```
:::

	
### Update Versions

Regular [updates and patches](#versions) of CAP Java keeps your project in sync with the most recent Free and Open Source Software (FOSS) dependency versions.

However, a security vulnerability could be published in between CAP Java releases and in turn prevent your application from being released due to failing security scans. 
In this case, applications have the following options:

- Wait for the next monthly CAP Java release with fixed dependencies.
- Specify a secure version of the vulnerable dependency explicitly at the beginning of the `dependencyManagement` section of the top-level *pom.xml* file of your application:

::: code-group
```xml [pom.xml]
<dependencyManagement>
   […]
   <dependency>
       <groupId>…</groupId>
       <artifactId>…</artifactId>
       <version>…</version>
   </dependency>
</dependencyManagement>
```
:::

Make sure that the updated version is compatible. When consuming a new CAP Java version, this extra dependency can be removed again.

<div id="in-update-versions" />