---
synopsis: >
  Guides for the migration from CAP Java Classic to the current CAP Java as well as for the migration from CAP Java 1.x to CAP Java 2.x.
status: released
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/9186ed9ab00842e1a31309ff1be38792.html
---
<!--- Migrated: @external/java/900-Migration/0-index.md -> @external/java/migration.md -->

# Migration Guides

<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>

<div v-html="$frontmatter.synopsis" />

[[toc]]

## CAP Java Classic to CAP Java 1.x

To make the CAP Java SDK and therefore the applications built on it future-proof, we revamped the CAP Java SDK. Compared the classic CAP Java Runtime (also known as the "Java Gateway stack"), the new CAP Java SDK has numerous benefits:

- Starts up much faster
- Supports local development with SQLite
- Has clean APIs to register event handlers
- Integrates nicely with Spring and Spring Boot
- Supports custom protocol adapters (OData V4 support included)
- Has a modular design: Add features as your application grows
- Enables connecting to advanced SAP BTP services like SAP Event Mesh

We strongly recommend adopting the new CAP Java SDK when starting a new project. Existing projects that currently use the classic CAP Java Runtime can adopt the new CAP Java SDK midterm to take advantage of new features and the superior architecture. In the following sections, we describe the steps to migrate a Java project from the classic CAP Java Runtime to the new CAP Java SDK.



### OData Protocol Version

The classic CAP Java Runtime came in several different flavors supporting either the OData V2 or V4 protocols. The new CAP Java SDK streamlines this by providing a common [protocol adapter layer](architecture#protocol-adapters), which enables to handle any OData protocol version or even different protocols with *one* application backend. Hence, if you decide to change the protocol that exposes your domain model, you no longer have to change your business logic.

::: tip
By default, the CAP Java Runtime comes with protocol adapters for OData V4 and [OData V2 (Beta)](#v2adapter). Therefore, you can migrate your frontend code to new CAP Java SDK without change. In addition, you have the option to move from SAP Fiori Elements V2 to SAP Fiori Elements V4 at any time.
:::

### Migrate the Project Structure

Create a new CAP Java project beside your existing one, which you want to migrate. You can use the CAP Java Maven archetype to create a new CAP Java project:

```shell
mvn archetype:generate -DarchetypeArtifactId=cds-services-archetype -DarchetypeGroupId=com.sap.cds -DarchetypeVersion=RELEASE
```

<div id="release-sap" />

Further details about creating a new CAP Java project and the project structure itself can be found in section [Starting a New Project](./getting-started#new-project).

By default, the Java service module goes to the folder `srv`. If you want to use a different service module folder, you have to adapt it manually.
Rename the service module folder to your preferred name and adjust also the `<modules>` section in the file `pom.xml` in your projects root folder:

```xml
...
<modules>
	<module>srv</module> <!-- replace srv with your folder name -->
</modules>
...
```

::: tip
If you’ve changed the service module folder name, you have to consider this in the next steps.
:::

### Copy the CDS Model

Now, you can start migrating your CDS model from the classic project to the newly created CAP Java project.

Therefore, copy your CDS model and data files (_*.cds_ & _*.csv_) manually from the classic project to the corresponding locations in the new project, presumably the `db` folder. If you organize your CDS files within subfolders, also re-create these subfolders in the new project to ensure the same relative path between copied CDS files. Otherwise, compiling your CDS model in the new project would fail.

Usually the CDS files are located in the following folders:

| Usage | Location in classic project | Location in new CAP Java project |
| --- | --- | --- |
| Database Model | `<CLASSIC-PROJECT-ROOT>/db/**` | `<NEW-PROJECT-ROOT>/db/**` |
| Service Model | `<CLASSIC-PROJECT-ROOT>/srv/**` | `<NEW-PROJECT-ROOT>/srv/**` |

If your CDS model depends on other reusable CDS models, add those dependencies to `<NEW-PROJECT-ROOT>/package.json`:

```json
...
"dependencies": {
	"@sap/cds": "^3.0.0",
	...  // add your CDS model reuse dependencies here
},
...
```

::: tip
In your CDS model, ensure that you explicitly define the data type of the elements whenever an aggregate function (max, min, avg etc.) is used, else the build might fail.
:::

In the following example, element `createdAt` has an explicitly specified datatype (that is `timestamp`):

```cds
view AddressView as select from Employee.Address {
    street, apartment, postal_code, MAX(createdAt) AS createdAt: timestamp
};
```

#### CDS Configuration

The CDS configuration is also part of `<PROJECT-ROOT>/package.json` and has to be migrated as well from the classic to the new project.
Therefore, copy and replace the whole `cds` section from your classic _package.json_ to the new project:

```json
...
"dependencies": {
	"@sap/cds": "^3.0.0",
},
"cds": { // copy this CDS configuration from your classic project
	...
}
...
```

::: tip
If there’s also a `<CLASSIC-PROJECT-ROOT>/.cdsrc.json` in your classic project to configure the CDS build, copy this file to the new project.
:::

You can validate the final CDS configuration by executing a CDS command in the root folder of the new project:

```shell
cds env
```

It prints the effective CDS configuration on the console. Check, that this configuration is valid for your project.
Execute this command also in your classic project and compare the results, they should be same.

Further details about effective CDS configuration can be found in section [Effective Configuration](../node.js/cds-env#cli).

#### First Build and Deployment

After you’ve copied all your CDS files, maintained additional dependencies and configured the CDS build,
you can try to build your new CAP Java project the first time.
Therefore, execute the following Maven command in the root folder of your new CAP Java project:

```shell
mvn clean install
```

If this Maven build finishes successfully, you can optionally try to deploy your CDS model to an SAP HANA database by executing the following CDS command:

```shell
cds deploy --to hana
```

[See section **SAP HANA Cloud** for more details about deploying to SAP HANA.](../guides/databases#get-hana){.learn-more}


### Migrate Java Business Logic

#### Migrate Dependencies

Now, it's time to migrate your Java business logic. If your event handlers require additional libraries that go beyond the already provided Java Runtime API,
add those dependencies manually to section `dependencies` in file `<NEW-PROJECT-ROOT>/srv/pom.xml`, for example:

```xml
...
<dependencies>
	<!-- add your additional dependencies here -->
	...
	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-starter-spring-boot-odata</artifactId>
	</dependency>
	<dependency>
		<groupId>org.xerial</groupId>
		<artifactId>sqlite-jdbc</artifactId>
	</dependency>
	...
</dependencies>
...
```

::: tip
Don't add any dependencies of the classic Java Runtime to the new project. Those dependencies are already replaced with the corresponding version of the new CAP Java SDK.
:::


#### Migrate Event Handlers

In the next steps, you have to adapt your Java classes to be compatible with the new Java Runtime API.
That means, you'll copy and migrate your event handler classes from the classic to the new project.
It will be required to modify and adapt your Java source code to be compatible with the new Java SDK.

Usually the event handler classes and tests are located in these folders:

| Usage | Location in classic project | Location in new CAP Java project |
| --- | --- | --- |
| Handler classes| `<CLASSIC-PROJECT-ROOT>/srv/src/main/java/**` | `<NEW-PROJECT-ROOT>/srv/src/main/java/**` |
| Test classes  | `<CLASSIC-PROJECT-ROOT>/srv/src/test/java/**` | `<NEW-PROJECT-ROOT>/srv/src/test/java/**` |

Copy your Java class files (`*.java`) manually from the classic project to corresponding locations in the new project.
It’s important that you re-create the same subfolder structure in the new project as it is in the classic project.
The subfolder structure reflects the Java package names of your Java classes.

##### Annotations

Annotate all of your event handler classes with the following annotations and ensure a unique service name:

```java
@org.springframework.stereotype.Component
@com.sap.cds.services.handler.annotations.ServiceName("serviceName")
```

::: tip
All event handler classes also *have* to implement the marker interface `com.sap.cds.services.handler.EventHandler`. Otherwise, the event handlers defined in the class won't get called.
:::

Finally, your event handler class has to look similar to this example:

```java
import org.springframework.stereotype.Component;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.ServiceName;

@Component
@ServiceName("AdminService")
public class AdminServiceHandler implements EventHandler {

}
```

The new CAP Java SDK introduces new annotations for event handlers. Replace event annotations at event handler methods according to this table:

| Classic Java Runtime | CAP Java SDK |
| --- | --- |
| `@BeforeCreate(entity = "yourEntityName")` | `@Before(event = CqnService.EVENT_CREATE, entity = "yourEntityName")` |
| `@BeforeDelete(entity = "yourEntityName")` | `@Before(event = CqnService.EVENT_DELETE, entity = "yourEntityName")` |
| `@BeforeRead(entity = "yourEntityName")` | `@Before(event = CqnService.EVENT_READ, entity = "yourEntityName")` |
| `@BeforeQuery(entity = "yourEntityName")` | `@Before(event = CqnService.EVENT_READ, entity = "yourEntityName")` |
| `@BeforeUpdate(entity = "yourEntityName")` | `@Before(event = CqnService.EVENT_UPDATE, entity = "yourEntityName")` |
| `@Create(entity = "yourEntityName")` | `@On(event = CqnService.EVENT_CREATE, entity = "yourEntityName")` |
| `@Delete(entity = "yourEntityName")` | `@On(event = CqnService.EVENT_DELETE, entity = "yourEntityName")` |
| `@Query(entity = "yourEntityName")` | `@On(event = CqnService.EVENT_READ, entity = "yourEntityName")` |
| `@Read(entity = "yourEntityName")` | `@On(event = CqnService.EVENT_READ, entity = "yourEntityName")` |
| `@Update(entity = "yourEntityName")` | `@On(event = CqnService.EVENT_UPDATE, entity = "yourEntityName")` |
| `@AfterCreate(entity = "yourEntityName")` | `@After(event = CqnService.EVENT_CREATE, entity = "yourEntityName")` |
| `@AfterRead(entity = "yourEntityName")` | `@After(event = CqnService.EVENT_READ, entity = "yourEntityName")` |
| `@AfterQuery(entity = "yourEntityName")` | `@After(event = CqnService.EVENT_READ, entity = "yourEntityName")` |
| `@AfterUpdate(entity = "yourEntityName")` | `@After(event = CqnService.EVENT_UPDATE, entity = "yourEntityName")` |
| `@AfterDelete(entity = "yourEntityName")` | `@After(event = CqnService.EVENT_DELETE, entity = "yourEntityName")` |

::: tip
The `sourceEntity` annotation field doesn't exist in the new CAP Java SDK. In case your event handler should only be called for specific source entities you need to achieve this by [analyzing the CQN](query-introspection#using-the-iterator) in custom code.
:::

##### Event Handler Signatures

The basic signature of an event handler method is `void process(EventContext context)`.
However, it doesn’t provide the highest level of comfort. Event handler signatures can vary on three levels:
- EventContext arguments
- POJO-based arguments
- Return type

Replace types from package `com.sap.cloud.sdk.service.prov.api.request` in the classic Java Runtime by types from package `com.sap.cds.services.cds` as described by the following table:

| Classic Java Runtime | New CAP Java SDK |
| --- | --- |
| `CreateRequest` | `CdsCreateEventContext` |
| `DeleteRequest` | `CdsDeleteEventContext` |
| `QueryRequest` | `CdsReadEventContext` |
| `ReadRequest` | `CdsReadEventContext` |
| `UpdateRequest` | `CdsUpdateEventContext` |
| `ExtensionHelper` | Use dependency injection provided by Spring |

You can also get your entities injected by adding an additional argument with one of the following types:
- `java.util.stream.Stream<yourEntityType>`
- `java.util.List<yourEntityType>`

[See section **Event Handler Method Signatures** for more details.](provisioning-api#handlersignature){.learn-more}

Also replace the classic handler return types with the corresponding new implementation:

| Classic Java Runtime | New CAP Java SDK |
| --- | --- |
| return `BeforeCreateResponse` | call `CdsCreateEventContext::setResult(..)` or return `Result` |
| return `BeforeDeleteResponse` | call `CdsDeleteEventContext::setResult(..)` or return `Result` |
| return `BeforeQueryResponse` | call `CdsReadEventContext::setResult(..)` or return `Result` |
| return `BeforeReadResponse` | call `CdsReadEventContext::setResult(..)` or return `Result` |
| return `BeforeUpdateResponse` | call `CdsUpdateEventContext::setResult(..)` or return `Result` |


### Delete Obsolete Files

There are numerous files in your classic project, which aren’t required and supported anymore in the new project.
Don't copy any of the following files to the new project:

```
<PROJECT-ROOT>/
|-- db/
|   |-- .build.js
|   `-- package.json
`-- srv/src/main/
            |-- resources/
            |    |-- application.properties
            |    `-- connection.properties
            `-- webapp/
                 |-- META-INF/
                 |   |-- sap_java_buildpack/config/resources_configuration.xml
                 |   `-- context.xml
                 `-- WEB-INF/
                     |-- resources.xml
                     |-- spring-security.xml
                     `-- web.xml
```


### Transaction Hooks

In the Classic Java Runtime, it was possible to hook into the transaction initialization and end phase by adding the annotations `@InitTransaction` or `@EndTransaction` to a public method. The method annotated with `@InitTransaction` was invoked just after the transaction started and before any operation executed. Usually this hook was used to validate incoming data across an OData batch request.

[See section **InitTransaction Hook** for more details about init transaction hook in classic CAP Java.](./custom-logic/hooks#inittransaction-hook){.learn-more}

The method annotated with `@EndTransaction` was invoked after all the operations in the transaction were completed and before the transaction was committed.

[See section **EndTransaction Hook** for more details about end transactions hook in classic CAP Java.](./custom-logic/hooks#endtransaction-hook){.learn-more}

The new CAP Java SDK doesn't support these annotations anymore. Instead, it supports registering a `ChangeSetListener` at the `ChangeSetContext` supporting hooks for `beforeClose` and `afterClose`.

[See section **Reacting on ChangeSets** for more details.](changeset-contexts#reacting-on-changesets){.learn-more}

To replace the `@InitTransaction` handler, you can use the `beforeClose` method, instead. This method is called at the end of the transaction and can be used, for example, to validate incoming data across multiple requests in an OData batch *before* the transaction is committed. It's possible to cancel the transaction in this phase by throwing an `ServiceException`.

The CAP Java SDK sample application shows how such a validation using the `ChangeSetListener` approach can be implemented. See [here](https://github.com/SAP-samples/cloud-cap-samples-java/blob/cross-validation/srv/src/main/java/my/bookshop/handlers/ChapterServiceHandler.java) for the example code.

Note, that to validate incoming data for *single* requests, we recommend to use a simple `@Before` handler, instead.

[See section **Introduction to Event Handlers** for a detailed description about `Before` handler.](provisioning-api#before){.learn-more}


<!--- Migrated: @external/java/900-Migration/04-security.md -> @external/java/migration/security.md -->
### Security Settings

For applications based on Spring Boot, the new CAP Java SDK simplifies configuring *authentication* significantly: Using the classic CAP Java Runtime, you had to configure authentication for all application endpoints (including the endpoints exposed by your CDS model) explicitly. The new CAP Java SDK configures authentication for all exposed endpoints automatically, based on the security declarations in your CDS model.

*Authorization* can be accomplished in both runtimes with CDS model annotations  `@requires` and `@restrict` as described in section [Authorization and Access Control](../guides/authorization). Making use of the declarative approach in the CDS model is highly recommended.

In addition, the new CAP Java SDK enables using additional authentication methods. For instance, you can use basic authentication for mock users, which are useful for local development and testing. See section [Mock Users](./security#mock-users) for more details.

An overview about the general security configuration in the new CAP Java SDK can be found in section [Security](security).


#### Configuration and Dependencies

To make use of authentication and authorization with JWT tokens issued by XSUAA on the SAP BTP, add the following dependency to your `pom.xml`:

```xml
<dependency>
	<groupId>com.sap.cds</groupId>
	<artifactId>cds-feature-xsuaa</artifactId>
</dependency>
```

This feature provides utilities to access information in JWT tokens, but doesn’t activate authentication by default. Therefore, as in the classic CAP Java Runtime, activate authentication by adding a variant of the [XSUAA library](https://github.com/SAP/cloud-security-xsuaa-integration) suitable for your application (depending on if you use Spring, Spring Boot, plain Java) as described in the following sections.

##### Spring Boot

Activate Spring security with XSUAA authentication by adding the following Maven dependency:

```xml
<dependency>
	<groupId>com.sap.cloud.security.xsuaa</groupId>
	<artifactId>xsuaa-spring-boot-starter</artifactId>
	<version>${xsuaa.version}</version>
</dependency>
```

Maintaining a `spring-security.xml` file or a custom `WebSecurityConfigurerAdapter` or `SecurityFilterChain` isn’t necessary anymore because the new CAP Java SDK runtime *autoconfigures* authentication in the Spring context according to your CDS model:

- Endpoints exposed by the CDS model annotated with `@restrict` are automatically authenticated.
- Endpoints exposed by the CDS model *not* annotated with `@restrict` are public by definition and hence not authenticated.
- All other endpoints the application exposes manually through Spring are authenticated. If you need to change this default behavior either [manually configure these endpoints](./security#spring-boot) or turn off auto configuration of custom endpoints by means of the following application configuration parameter:

  ```yaml
  cds.security.authentication.authenticate-unknown-endpoints: false
  ```

##### Plain Java

The existing authentication configuration stays unchanged. No autoconfiguration is provided.

#### Enforcement API & Custom Handlers

The new CAP Java SDK offers a technical service called `AuthorizationService`, which serves as a replacement for the former % if jekyll.environment == "external" %}Enforcement APIs% else %}[Enforcement APIs](./custom-logic/authorization)% endif %}. Obtain a reference to this service just like for all other services, either explicitly through a `ServiceCatalog` lookup or per dependency injection in Spring:

```java
@Autowire
AuthorizationService authService;
```
Information of the request user is passed in the current `RequestContext`:

```java
EventContext context;
UserInfo user = context.getUserInfo();
```

or through dependency injection within a handler bean:

```java
@Autowire
UserInfo user;
```

With the help of these interfaces, the classic enforcement API can be mapped to the new API as listed in the following table:

| classic API                                           | new API                                          | Remarks
| :---------------------------------------------------- | :----------------------------------------------------- | ------------------- |
| `isAuthenticatedUser(String serviceName)`  | `authService.hasServiceAccess(serviceName, event)` |
| `isRegisteredUser(String serviceName)` | no substitution required  |
| `hasEntityAccess(String entityName, String event)` | `authService.hasEntityAccess(entityName, event)`    |
| `getWhereCondition()	`  | `authService.calcWhereCondition(entityName, event)` |
| `getUserName()` | `user.getName()` | The user's name is also referenced with `$user` and used for `managed` aspect.
| `getUserId()` | `user.getId()` |
| `hasUserRole(String roleName)` | `user.hasRole(roleName)`           |
| `getUserAttribute(String attributeName)` | `user.getAttribute(attributeName)`    |
| `isContainerSecurityEnabled()` | no substitution required            |

[See section **Enforcement API & Custom Handlers in Java** for more details.](./security#enforcement-api){.learn-more}


<!--- Migrated: @external/java/900-Migration/05-database.md -> @external/java/migration/database.md -->
### Data Access and Manipulation

There are several ways of accessing data. The first and most secure way is to use the Application Service through an `CqnService` instance. The second is to use `PersistenceService`, in that case the query execution is done directly against underlying datasource, bypassing all authority checks available on service layer. The third one is to use CDS4J component called `CdsDataStore`, which also executes queries directly.

#### Access Application Service in Custom Handler and Query Execution

To access an Application Service in custom handler and to execute queries, perform the following steps:

1) Inject the instance of `CqnService` in your custom handler class:

```java
	@Resource(name = "CatalogService")
	private CqnService catalogService;
```
[See section **Services Accepting CQN Queries** for more details.](consumption-api#cdsservices){.learn-more}

2) In each custom handler, replace instance of `DataSourceHandler` as well as `CDSDataSourceHandler` with the `CqnService` instance.

3) Rewrite and execute the query (if any).

Example of query execution in *Classic Java Runtime*:

```java
CDSDataSourceHandler cdsHandler = DataSourceHandlerFactory.getInstance().getCDSHandler(getConnection(), queryRequest.getEntityMetadata().getNamespace());

CDSQuery cdsQuery = new CDSSelectQueryBuilder("CatalogService.Books")
	.selectColumns("id", "title")
	.where(new ConditionBuilder().columnName("title").IN("Spring", Java"))
	.orderBy("title", true)
	.build();

cdsHandler.executeQuery(cdsQuery);
```

[See section **CDS Data Source** for more details.](./custom-logic/remote-data-source#cds-data-source){.learn-more}

The corresponding query and its execution in *New CAP Java SDK* looks as follows:

```java
Select query =  Select.from("CatalogService.Books")
	.columns("id", "title")
	.where(p -> p.get("title")
	.in("Spring", "Java"))
	.orderBy("title");

catalogService.run(query);
```

[See section **Query Builder API** for more details.](./query-api){.learn-more}

4) Rewrite and execute the CRUD operations (if any).

|Action|Classic Java Runtime|New CAP Java SDK|
|---|---|---|
|Create|`dsHandler.executeInsert(request.getData(), true)`|`catalogService.run(event.getCqn())` or `catalogService.run(Insert.into("Books").entry(book))`|
|Read|`dsHandler.executeRead(request.getEntityMetadata().getName(), request.getKeys(), request.getEntityMetadata().getElementNames());`|`catalogService.run(event.getCqn())` or `catalogService.run(Select.from("Books").where(b->b.get("ID").eq(42)))`|
|Update|`dsHandler.executeUpdate(request.getData(), request.getKeys(), true)`|`catalogService.run(event.getCqn())` or `catalogService.run(Update.entity("Books").data(book))`|
|Delete| `dsHandler.executeDelete(request.getEntityMetadata().getName(), request.getKeys())` |`catalogService.run(event.getCqn())` or `catalogService.run(Delete.from("Books").where(b -> b.get("ID").eq(42)))`|

As you can see in *New CAP Java SDK* it’s possible to either directly execute a CQN of the event, or you can construct and execute your own custom query.

[See section **Query Builder API** for more details.](./query-api){.learn-more}

#### Accessing `PersistenceService`

If for any reason you decided to use `PersistenceService` instead of `CqnService` in your custom handler, you need to inject the instance of `PersistenceService` in your custom handler class:

```java
@Autowired
private PersistenceService persistence;
```

[See section **Persistence API** for more details.](./consumption-api#persistenceservice){.learn-more}

Example of Query execution in *Classic Java Runtime*:

```java
CDSDataSourceHandler cdsHandler = ...;

CDSQuery cdsQuery = new CDSSelectQueryBuilder("CatalogService.Books")
	.selectColumns("id", "title")
	.where(new ConditionBuilder().columnName("title").IN("Spring", Java"))
	.orderBy("title", true)
	.build();

cdsHandler.executeQuery(cdsQuery);
```

The corresponding query execution in *New CAP Java SDK* looks as follows:

```java
Select query =  Select.from("CatalogService.Books")
	.columns("id", "title")
	.where(p -> p.get("title")
	.in("Spring", "Java"))
	.orderBy("title");

persistence.run(query);
```

#### Accessing `CdsDataStore`

If you want to use `CdsDataStore` in your custom handler, you first need to do the steps described in section [Accessing PersistenceService](#accessing-persistenceservice). After that you can get the instance of `CdsDataStore` using `persistence.getCdsDataStore()` method:

```java
Select query =  ...; // construct the query

CdsDataStore cdsDataStore = persistence.getCdsDataStore();
cdsDataStore.execute(query);
```


### CDS OData V2 Adapter { #v2adapter}

When you generate a new project using the [CAP Java Maven Archetype](./getting-started#new-project), OData V4 is enabled by default.

To be able to migrate the backend from the *Classic Java Runtime* without making changes in your frontend code, you can activate the *OData V2 Adapter* as follows:

1. Add the following dependency to the `pom.xml` of your `srv` module:

	```xml
	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-adapter-odata-v2</artifactId>
		<scope>runtime</scope>
	</dependency>
	```

2. In addition, turn off the OData V4 adapter by replacing the following dependency:

	```xml
	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-starter-spring-boot-odata</artifactId>
	</dependency>
	```

	with

	```xml
	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-starter-spring-boot</artifactId>
	</dependency>
	```

	if present. Additionally, remove the dependency

	```xml
	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-adapter-odata-v4</artifactId>
	</dependency>
	```

	if present.

3. To make the CDS Compiler generate EDMX for OData V2, add or adapt the following property in the _.cdsrc.json_ file:

	```json
	{
		[...]
		"odata": {
			"version": "v2"
		}
	}
	```

	::: tip
	In case you're using [multitenancy](./multitenancy), keep in mind to make the same change in the _.cdsrc.json_ of the _mtx-sidecar_.
	:::

After rerunning the Maven build and starting the CAP Java application, Application Services are served as OData V2. By default, the endpoints will be available under `<host:port>/odata/v2/<Service>`. The default response format is `xml`, to request `json` use `$format=json` or `Accept: application/json` header.

::: tip
The index page available at \<host:port\> lists service endpoints of all protocol adapters.
:::



#### Enabling OData V2 and V4 in Parallel

You can also use OData V2 and V4 in parallel. However, by default the Maven build generates EDMX files for one OData version, only. Therefore, you've to add an extra compile step for the missing OData version to the Maven build of your application:

1. In _.cdsrc_, choose `v4` for `odata.version`

2. Add an extra compile command to the subsection `commands` of the section with ID `cds.build` in the *pom.xml* file in the *srv* folder of your project:

	```xml
	<command>compile ${project.basedir} -s all -l all -2 edmx-v2 -o ${project.basedir}/src/main/resources/edmx/v2</command>
	```

	This command picks up all service definitions in the Java project base directory (`srv` by default) and generates EDMX for OData V2. It also localizes the generated EDMX files with all available translations. For more information on the previous command, call `cds help compile` on the command line. If your service definitions are located in a different directory, adopt the previous command. If your service definitions are contained in multiple directories, add the previous command for each directory separately. Make sure to use at least `cds-dk 3.2.0` for this step.

3. Make sure that the dependencies to the OData V2 and V4 adapters are present in your *pom.xml* file:

	```xml
	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-starter-spring-boot</artifactId>
	</dependency>

	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-adapter-odata-v2</artifactId>
		<scope>runtime</scope>
	</dependency>

	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-adapter-odata-v4</artifactId>
		<scope>runtime</scope>
	</dependency>
	```

4. Optionally it's possible to configure different serve paths for the application services for different protocols. See [Serve configuration](./application-services#serve-configuration) for more details.

After rebuilding and restarting your application, your Application Services are exposed as OData V2 and OData V4 in parallel. This way, you can migrate your frontend code iteratively to OData V4.

<!-- TODO: Move this to "Development" section -->

<span id="afterenablingodata" />

## CAP Java 1.x to CAP Java 2.x { #one-to-two .impl.beta}

This section describes the changes in CAP Java between the major versions 1.x and 2.x. It provides also helpful information to migrate a CAP Java application to the new major version 2.x.

::: warning
This migration guide is published as a preview. It may be subject to change before the relase of CAP Java 2.0.
:::

### Spring Boot 3

CAP Java 2 uses Spring Boot 3 as underlying framework. Please consult the [Spring Boot 3.0 Migration Guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide) for changes between Spring Boot 2.7 and Spring Boot 3.0. A CAP Java application is typically only affected by Spring Boot 3 incompatibilities if it uses native Spring APIs.

#### Java 17

Spring Boot 3 requires Java 17 as minimum version.
Maven dependencies, which are not managed by CAP Java, need to be updated to Java 17 compatible versions.

#### Jakarta EE 10

Spring Boot 3 requires Jakarta EE 10. This includes a switch in package names from `javax` to `jakarta`. For example all Servlet-related classes are moved from package `javax.servlet` to `jakarta.servlet`.
Maven dependencies, which are not managed by CAP Java or Spring Boot, need to be updated to Jakarta EE 10 compatible versions.

#### Spring Security

Since version 1.27 CAP Java is running with Spring Boot 2.7, which uses Spring Security 5.7. Spring Boot 3 uses Spring Security 6. In case you defined custom security configurations you need to follow the guides, which describe the [migration from 5.7 to 5.8](https://docs.spring.io/spring-security/reference/5.8/migration/index.html) and the [migration from 5.8 to 6.0](https://docs.spring.io/spring-security/reference/6.0/migration/index.html).

### API Cleanup

Some interfaces, methods, configuration properties and annotations, which had already been deprecated in 1.x, are now removed in version 2.x.

#### Legacy Upsert

The [legacy upsert](query-execution#legacy-upsert-implementation) (cascading delete + deep insert), which can be configured via the global configuration parameter `cds.sql.upsert.strategy: replace` or a hint, has been removed. If you rely on the replace behavior of the legacy upsert, use a cascading delete followed by a deep insert.

#### Representation of Pagination {#limit}
The interfaces [CqnLimit](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/1.36.0/com/sap/cds/ql/cqn/CqnLimit.html) and [Limit](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/1.36.0/com/sap/cds/ql/Limit.html) are removed. Use the methods `limit(top)` and `limit(top, skip)` of the `Select` and `Expand` to specify the pagination settings. Use the methods [top()](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/1.36.0/com/sap/cds/ql/cqn/CqnEntitySelector.html#skip--) and [skip()](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/1.36.0/com/sap/cds/ql/cqn/CqnEntitySelector.html#skip--) of the `CqnEntitySelector` to introspect the pagination settings of a `CqnExpand` and `CqnSelect`.

#### Statement Modification {#modification}

##### Removal of Deprecated CqnModifier
The deprecated [CqnModifier](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/1.36.0/com/sap/cds/ql/cqn/CqnModifier.html), whose default methods make expensive copies of literal values, is removed. Instead, use the [Modifier](https://javadoc.io/doc/com.sap.cds/cds4j-api/latest/com/sap/cds/ql/cqn/Modifier.html) as documented in [Modifying CQL Statements](query-api#copying-modifying-cql-statements).

If your modifier overrides one or more of the `CqnModifier:literal` methods that take `value` and `cdsType` as arguments, override `Modifier:literal(CqnLiteral<?> literal)` instead. You can create new values using `CQL.val(value).type(cdsType);`.

##### Removal of Deprecated Methods in Modifier
The deprecated methods `ref(ElementRef<?>)` and `ref(StructuredTypeRef ref)` are removed, instead override `ref(CqnElementRef)` and `ref(CqnStructuredTypeRef)`. To create a modifiable copy of the ref, use `CQL.copy(ref)`.

#### Overview of Removed Interfaces

##### Interface `com.sap.cds.services.cds.CdsService`
The interface [CdsService](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/cds/CdsService.html) is removed and replaced with the equivalent interface [CqnService](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/cds/CqnService.html).

##### Interface `com.sap.cds.services.environment.ServiceBinding`
The interface [`com.sap.cds.services.environment.ServiceBinding`](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/environment/ServiceBinding.html) is deprecated and replaced with interface [`com.sap.cloud.environment.servicebinding.api.ServiceBinding`](https://github.com/SAP/btp-environment-variable-access/blob/main/api-parent/core-api/src/main/java/com/sap/cloud/environment/servicebinding/api/ServiceBinding.java). For convience the adapter class `com.sap.cds.services.utils.environment.ServiceBindingAdapter` is provided, which maps the deprecated interface to the new one.

#### Interface `com.sap.cds.services.handler.EventPredicate`
The interface `com.sap.cds.services.handler.EventPredicate` is removed. Consequently, all methods at interface [`com.sap.cds.services.Service`](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/Service.html) containing this interface as argument are removed. All removed method were marked as deprecated in prior releases.

#### Method `CdsRuntime.runInRequestContext(Request, Function|Consumer)`
The interface [`com.sap.cds.services.runtime.Request`](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/runtime/Request.html) and its used interfaces [`com.sap.cds.services.runtime.RequestParameters`](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/runtime/RequestParameters.html) and [`com.sap.cds.services.runtime.RequestUser`](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/runtime/RequestUser.html) are removed. They were still used in the method [`CdsRuntime.runInRequestContext(Request, Function|Consumer)`](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/runtime/CdsRuntime.html#runInRequestContext-com.sap.cds.services.runtime.Request-java.util.function.Consumer-), which was also deprecated and should be replaced by [`CdsRuntime.requestContext()`](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/runtime/CdsRuntime.html#requestContext--)[`.run(Function)`](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/runtime/RequestContextRunner.html#run-java.util.function.Consumer-)

#### Overview of Removed Methods

The following deprecated methods are removed:

| Class / Interface (com.sap.cds...) | Method / Field | Replacement |
| --- | --- | --- |
| [...ql.cqn.CqnReference.Segment](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/1.36.0/com/sap/cds/ql/cqn/CqnReference.Segment.html) | [accept(visitor)](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/1.36.0/com/sap/cds/ql/cqn/CqnReference.Segment.html#accept-com.sap.cds.ql.cqn.CqnVisitor-) | [CqnReference.accept(visitor)](https://javadoc.io/doc/com.sap.cds/cds4j-api/latest/com/sap/cds/ql/cqn/CqnReference.html#accept-com.sap.cds.ql.cqn.CqnVisitor-) |
| [...ql.cqn.CqnVisitor](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/1.36.0/com/sap/cds/ql/cqn/CqnVisitor.html) | [visit(CqnReference.Segment seg)](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/1.36.0/com/sap/cds/ql/cqn/CqnVisitor.html#visit-com.sap.cds.ql.cqn.CqnReference.Segment-) | [visit(CqnElementRef)](https://javadoc.io/doc/com.sap.cds/cds4j-api/latest/com/sap/cds/ql/cqn/CqnVisitor.html#visit-com.sap.cds.ql.cqn.CqnElementRef-), [visit(CqnStructuredTypeRef)](https://javadoc.io/doc/com.sap.cds/cds4j-api/latest/com/sap/cds/ql/cqn/CqnVisitor.html#visit-com.sap.cds.ql.cqn.CqnStructuredTypeRef-)|
| [...ql.cqn.Modifier](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/1.36.0/com/sap/cds/ql/cqn/Modifier.html) | [expand(ref, items, orderBy, limit)](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/1.36.0/com/sap/cds/ql/cqn/Modifier.html#expand-com.sap.cds.ql.StructuredTypeRef-java.util.List-java.util.List-com.sap.cds.ql.cqn.CqnLimit-) |  [expand(expand)](https://javadoc.io/doc/com.sap.cds/cds4j-api/latest/com/sap/cds/ql/cqn/Modifier.html#expand-com.sap.cds.ql.Expand-) |
| | [in(value, list)](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/1.36.0/com/sap/cds/ql/cqn/Modifier.html#in-com.sap.cds.ql.Value-java.util.Collection-) | [in(value, valueSet)](https://javadoc.io/doc/com.sap.cds/cds4j-api/latest/com/sap/cds/ql/cqn/Modifier.html#in-com.sap.cds.ql.Value-com.sap.cds.ql.cqn.CqnValue-)|
| | [limit(limit)](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/1.36.0/com/sap/cds/ql/cqn/Modifier.html#limit-com.sap.cds.ql.Limit-) | [skip(skip)](https://javadoc.io/doc/com.sap.cds/cds4j-api/latest/com/sap/cds/ql/cqn/Modifier.html#skip-long-), [top(top)](https://javadoc.io/doc/com.sap.cds/cds4j-api/latest/com/sap/cds/ql/cqn/Modifier.html#top-long-)|
| | [selectListItem(value, alias)](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/1.36.0/com/sap/cds/ql/cqn/Modifier.html#selectListItem-com.sap.cds.ql.Value-java.lang.String-) | [selectListValue(value, alias)](https://javadoc.io/doc/com.sap.cds/cds4j-api/latest/com/sap/cds/ql/cqn/Modifier.html#selectListValue-com.sap.cds.ql.Value-java.lang.String-) |
| [...services.ErrorStatus](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/ErrorStatus.html) | [getCode()](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/ErrorStatus.html#getCode--) | [getCodeString()](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/ErrorStatus.html#getCodeString--)|
| [...services.ServiceException](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/ServiceException.html) | [messageTarget(prefix, entity, path)](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/ServiceException.html#messageTarget-java.lang.String-java.lang.String-java.util.function.Function-) |[messageTarget(parameter, path)](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/ServiceException.html#messageTarget-java.lang.String-java.util.function.Function-) |
| [...services.request.ParameterInfo](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/request/ParameterInfo.html) | [getQueryParameters()](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/request/ParameterInfo.html#getQueryParameters--) | [getQueryParams()](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/request/ParameterInfo.html#getQueryParams--) |
| [...services.request.UserInfo](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/request/UserInfo.html) | [getAttribute(String)](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/request/UserInfo.html#getAttribute-java.lang.String-) | [getAttributeValues(String)](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/request/UserInfo.html#getAttributeValues-java.lang.String-) |
| [...services.runtime.CdsModelProvider](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/runtime/CdsModelProvider.html) | [get(tenantId)](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/runtime/CdsModelProvider.html#get-java.lang.String-)  | [get(userInfo, features)](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/runtime/CdsModelProvider.html#get-com.sap.cds.services.request.UserInfo-com.sap.cds.services.request.FeatureTogglesInfo-)|
| [...services.messages.Message](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/messages/Message.html) | [target(prefix, entity, path)](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/messages/Message.html#target-java.lang.String-java.lang.String-java.util.function.Function-) | [target(start, path)](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/messages/Message.html#target-java.lang.String-java.util.function.Function-)|
| [...services.messages.MessageTarget](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/messages/MessageTarget.html) | [getPrefix()](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/messages/MessageTarget.html#getPrefix--) | [getParameter()](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/messages/MessageTarget.html#getParameter--) |
| | [getEntity()](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/messages/MessageTarget.html#getEntity--), [getPath()](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/messages/MessageTarget.html#getPath--)| [getRef()](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/messages/MessageTarget.html#getRef--)  |
| [...services.persistence.PersistenceService](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/persistence/PersistenceService.html) | [getCdsDataStore()](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/persistence/PersistenceService.html#getCdsDataStore--) | Use [PersistenceService](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/persistence/PersistenceService.html#getCdsDataStore--) |
|[...services.runtime.CdsRuntime](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/runtime/CdsRuntime.html) |[runInChangeSetContext(Consumer)](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/runtime/CdsRuntime.html#runInChangeSetContext-java.util.function.Consumer-) | [changeSetContext()](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/runtime/CdsRuntime.html#changeSetContext--).[run(Consumer)](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/runtime/ChangeSetContextRunner.html#run-java.util.function.Consumer-) |
| |[runInChangeSetContext(Function)](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/runtime/CdsRuntime.html#runInChangeSetContext-java.util.function.Function-) | [changeSetContext()](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/runtime/CdsRuntime.html#changeSetContext--).[run(Function)](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/runtime/ChangeSetContextRunner.html#run-java.util.function.Function-) |
| |[runInRequestContext(Consumer)](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/runtime/CdsRuntime.html#runInRequestContext-com.sap.cds.services.runtime.Request-java.util.function.Consumer-) | [requestContext()](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/runtime/CdsRuntime.html#requestContext--).[run(Consumer)](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/runtime/RequestContextRunner.html#run-java.util.function.Consumer-) |
| |[runInRequestContext(Function)](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/runtime/CdsRuntime.html#runInRequestContext-com.sap.cds.services.runtime.Request-java.util.function.Function-) | [requestContext()](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/runtime/CdsRuntime.html#requestContext--).[run(Function)](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/runtime/RequestContextRunner.html#run-java.util.function.Function-) |
| [...services.utils.CdsErrorStatuses]() | `CONSTRAINT_VIOLATED` |`UNIQUE_CONSTRAINT_VIOLATED` and `VALUE_REQUIRED` |


#### Overview of Removed CDS Properties

Some CdsProperties were already marked as deprected in CAP Java 1.x and are now removed in 2.x.

| removed | replacement |
| --- | --- |
| [cds.dataSource.serviceName](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/environment/CdsProperties.DataSource.html) | `cds.dataSource.binding` |
| cds.drafts.associationsToInactiveEntities | see [Lean Draft](#lean-draft) |
| [cds.locales.normalization.whiteList](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/environment/CdsProperties.Locales.Normalization.html) | `cds.locales.normalization.includeList` |
| [cds.messaging.services.\<key\>.queue.maxFailedAttempts](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/environment/CdsProperties.Messaging.MessagingServiceConfig.Queue.html) | Use custom error handling |
| [cds.messaging.services.\<key\>.topicNamespace](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/environment/CdsProperties.Messaging.MessagingServiceConfig.html) | `cds.messaging.services.<key>.subscribePrefix` |
| [cds.multiTenancy.instanceManager](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/environment/CdsProperties.MultiTenancy.html) | `cds.multiTenancy.serviceManager` |
| [cds.multiTenancy.dataSource.hanaDatabaseIds](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/environment/CdsProperties.MultiTenancy.Sidecar.DataSource.html) | obsolete, information is automatically retrieved from bindings |
| [cds.odataV4.indexPage](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/environment/CdsProperties.ODataV4.html) | `cds.indexPage` |
| [cds.security.authenticateUnknownEndpoints](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/environment/CdsProperties.Security.html#isAuthenticateUnknownEndpoints--) | `cds.security.authentication.authenticateUnknownEndpoints` |
| [cds.security.authorizeAutoExposedEntities](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/environment/CdsProperties.Security.html#getAuthorizeAutoExposedEntities--) | if disabled, add auto-exposed entities explicitly into your service definition |
| [cds.security.authorization.autoExposedEntities](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/environment/CdsProperties.Security.Authorization.html#getAutoExposedEntities--) | if disabled, add auto-exposed entities explicitly into your service definition |
| [cds.security.defaultRestrictionLevel](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/environment/CdsProperties.Security.html#getDefaultRestrictionLevel--) | `cds.security.authentication.mode` |
| [cds.security.draftProtection](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/environment/CdsProperties.Security.html#getDraftProtection--) | `cds.security.authorization.draftProtection` |
| [cds.security.instanceBasedAuthorization](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/environment/CdsProperties.Security.html#getInstanceBasedAuthorization--) | if disabled, remove `@requires` / `@restrict` annotations |
| [cds.security.authorization.instanceBasedAuthorization](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/environment/CdsProperties.Security.Authorization.html#getInstanceBasedAuthorization--) | remove `@requires` / `@restrict` annotations |
| [cds.security.openMetadataEndpoints](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/environment/CdsProperties.Security.html#isOpenMetadataEndpoints--) | `cds.security.authentication.authenticateMetadataEndpoints` |
| [cds.security.openUnrestrictedEndpoints](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/environment/CdsProperties.Security.html#getOpenUnrestrictedEndpoints--) | `cds.security.authentication.mode` |
| [cds.security.xsuaa.serviceName](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/environment/CdsProperties.Security.Xsuaa.html) | `cds.security.xsuaa.binding` |
| [cds.security.xsuaa.normalizeUserNames](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/environment/CdsProperties.Security.Xsuaa.html) | obsolete, effectively hard-coded to `false` |
| [cds.services](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/environment/CdsProperties.html) | cds.application.services |
| [cds.sql.upsert](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/1.32.0/com/sap/cds/services/environment/CdsProperties.Sql.Upsert.html) | See [Legacy Upsert](#legacy-upsert) |

### Overview of Removed Annotations

- `@search.cascade` is no longer supported. It's replaced by [@cds.search](../guides/providing-services/#using-cds-search-annotation).

### Changed behaviour

#### Null values in CDS QL query results

With CAP Java `2.x`, `null` values are not removed from the result of CDS QL queries anymore, this needs to be considered when using methods that operate on the key set of `Row`, such as `Row:containsKey`, `Row:keySet` and `Row:entrySet`.

#### Provider Tenant Normalization

The default value of CDS Property `cds.security.authentication.normalizeProviderTenant` is changed to `true`. With this change, the provider tenant is normalized and set to `null` in the UserInfo by default.

### Lean Draft

The property `cds.drafts.associationsToInactiveEntities` has been removed. It enabled a feature, which caused associations to other draft documents to combine active and inactive versions of the association target. This mixing of inactive and active data is no longer supported.
In cases where it is still required to connect two independent draft documents through an association you can annotate this association with `@odata.draft.enclosed`. Note that this will ensure, that the active version points to an active target, while the inactive version points to an inactive target. It will not mix active and inactive data into the same association.

The following table summarizes the behaviour of associations between different draft-enabled entities:

| Source Entity | Association Type | Target Entity | Draft Document Boundaries |
| --- | --- | --- | --- |
| active<sup>1</sup> | composition | active | same document |
| inactive<sup>2</sup> | composition | inactive | same document |
| active | [backlink](../cds/cdl#to-many-associations) association | active | same document |
| inactive | backlink association | inactive | same document |
| active | association | active | independent documents |
| inactive | association | active | independent documents |
| active | association with `@odata.draft.enclosed` | active | independent documents |
| inactive | association with `@odata.draft.enclosed` | inactive | independent documents |

<sup>1</sup> `IsActiveEntity = true`
<br>
<sup>2</sup> `IsActiveEntity = false`

### Changes to Maven Plugins

#### cds-maven-plugin

The deprecated parameters `generateMode` and `parserMode` are removed from the [goal generate](./assets/cds-maven-plugin-site/generate-mojo.html){target="_blank"}.

#### cds4j-maven-plugin

The deprecated Maven plugin `cds4j-maven-plugin` is removed and no longer available. It's replaced by the [`cds-maven-plugin`](./assets/cds-maven-plugin-site/plugin-info.html){target="_blank"} which provides the same functionality and more.
