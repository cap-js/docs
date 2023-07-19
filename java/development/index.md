---
synopsis: >
  Find here information on how to configure applications, different supported databases, spring boot integration, and the CDS Maven Plugin.
status: released
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/9186ed9ab00842e1a31309ff1be38792.html
---

# Development
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

## Application Configuration

This section describes how to configure applications. CAP Java applications can fully leverage [Spring Boot's](#spring-boot-integration) capabilities for [Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config). This enables you to define multiple **configuration profiles** for different scenarios, like local development and cloud deployment.

For a first introduction, have a look at our [sample application](https://github.com/sap-samples/cloud-cap-samples-java) and the [configuration profiles](https://github.com/SAP-samples/cloud-cap-samples-java/blob/master/srv/src/main/resources/application.yaml) we added there.

Now, that you’re familiar with how to configure your application, start to create your own application configuration. See the full list of [CDS properties](properties) as a reference.

### Service Bindings on SAP BTP, Kyma Runtime {#kubernetes-service-bindings}

In the SAP BTP, Kyma Runtime, credentials of service bindings are stored in Kubernetes secrets. Using volumes, you can mount secrets into your application's container. These volumes contain a file for each of the secrets properties.

#### Get the Secret into Your Container

To use a Kubernetes secret with your CAP service, you create a volume from it and mount it to the service's container.

*For example:*

```yaml
spec:
  volumes:
    - name: bookshop-db-secret-vol
      secret:
        secretName: bookshop-db-secret
  containers:
  - name: app-srv
    ...
    volumeMounts:
      - name: bookshop-db-secret-vol
        mountPath: /etc/secrets/sapcp/hana/bookshop-db
        readOnly: true
```

#### Prepare Your CAP Application

Add the `cds-feature-k8s` feature in the _pom.xml_ file of your CAP application to consume service credentials:

```xml
<dependencies>
    <!-- Features -->
    <dependency>
        <groupId>com.sap.cds</groupId>
        <artifactId>cds-feature-k8s</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

The feature supports reading multiple credentials from a common base directory and to read credentials from arbitrary directories.

#### Read Credentials from a Base Directory

The base directory for service credentials is the _/etc/secrets/sapcp_ directory. You can overwrite the default base directory with the `cds.environment.k8s.secretsPath` property.

Within this base directory, the directory structure for the service credentials is _\<service-name\>/\<instance-name\>_.

#### Read Credentials from Arbitrary Directories

You can also configure service bindings using the  `cds.environment.k8s.serviceBindings` configuration property.

For example:

```yaml
cds:
  environment:
    k8s:
      serviceBindings:
        bookshop-db:
          secretsPath: /etc/secrets/hana
          service: hana
          plan: hdi-shared
          tags:
           - hana
           - db
        bookshop-uaa:
          secretsPath: /etc/somewhere/else/xsuaa
          ...
```

The parameters `plan` and `tags` are optional.


## Spring Boot Integration { #spring-boot-integration}

This section describes the [Spring Boot](https://spring.io/projects/spring-boot) integration of the CAP Java SDK. Classic Spring isn’t supported.
Running your application with Spring Boot framework offers a number of helpful benefits that simplify the development and maintenance of the application to a high extend. Spring not only provides a rich set of libraries and tools for most common challenges in development, you also profit from a huge community, which constantly contributes optimizations, bug fixes and new features.

As Spring Boot not only is widely accepted but also most popular application framework, CAP Java SDK comes with a seamless integration of Spring Boot as described in the following sections.

### Spring Dependencies

To make your web application ready for Spring Boot, you need to make sure that the following Spring dependencies are referenced in your `pom.xml` (group ID `org.springframework.boot`):
* `spring-boot-starter-web`
* `spring-boot-starter-jdbc`
* `spring-boot-starter-security` (optional)

In addition, for activating the Spring integration of CAP Java SDK, the following runtime dependency is required:

```xml
<dependency>
    <groupId>com.sap.cds</groupId>
    <artifactId>cds-framework-spring-boot</artifactId>
    <version>${revision}</version>
    <scope>runtime</scope>
</dependency>
```

It might be more convenient to make use of CDS starter bundle `cds-starter-spring-boot-odata`, which not only comprises the necessary Spring dependencies, but also configures the OData V4 protocol adapter:

```xml
<dependency>
    <groupId>com.sap.cds</groupId>
    <artifactId>cds-starter-spring-boot-odata</artifactId>
    <version>${revision}</version>
</dependency>
```

### Spring Features

Beside the common Spring features such as dependency injection and a sophisticated test framework, the following features are available in Spring CAP applications in addition:

* CDS event handlers within custom Spring beans are automatically registered at startup.
* Full integration into Spring transaction management (`@Transactional` is supported).
* A various number of CAP Java SDK interfaces are exposed as [Spring beans](#exposed-beans) and are available in Spring application context such as technical services, the `CdsModel` or the `UserInfo` in current request scope.
* *Automatic* configuration of XSUAA, IAS and [mock user authentication](../security#mock-users) by means of Spring security configuration.
* Integration of `cds`-property section into Spring properties. See section [Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config) in the Spring Boot documentation for more details.
* [cds actuator](../observability#spring-boot-actuators) exposing monitoring information about CDS runtime and security.
* [DB health check indicator](../observability#spring-health-checks) which also applies to tenant-aware DB connections.

::: tip
None of the listed features will be available out of the box in case you choose to pack and deploy your web application as plain Java Servlet in a *war* file.
:::


### Spring Beans Exposed by the Runtime { #exposed-beans}

| Bean              | Description                      | Example
| :---------------------------------------------------- | :----------------------------------------------------- | :----------------------------------------------------- |
| [CdsRuntime](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/runtime/CdsRuntime.html)  | Runtime instance (singleton)  | `@Autowired`<br>`CdsRuntime runtime;`
| [CdsRuntimeConfigurer](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/runtime/CdsRuntimeConfigurer.html)  | Runtime configuration instance (singleton)  | `@Autowired`<br>`CdsRuntimeConfigurer configurer;`
| [Service](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/Service.html)  | All kinds of CDS services, application services and technical services   | `@Autowired`<br>`@Qualifier(CatalogService_.CDS_NAME)`<br>`private ApplicationService cs;`<br><br>`@Autowired`<br>`private PersistenceService ps;`
| [ServiceCatalog](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/ServiceCatalog.html)  | The catalog of all available services   | `@Autowired`<br>`ServiceCatalog catalog;`
| [CdsModel](https://javadoc.io/doc/com.sap.cds/cds4j-api/latest/com/sap/cds/reflect/CdsModel.html)  | The current model   | `@Autowired`<br>`CdsModel model;`
| [UserInfo](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/request/UserInfo.html)  | Information about the authenticated user   | `@Autowired`<br>`UserInfo userInfo;`
| [AuthenticationInfo](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/authentication/AuthenticationInfo.html)  | Authentication claims   | `@Autowired`<br>`AuthenticationInfo authInfo;`
| [ParameterInfo](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/request/ParameterInfo.html)  | Information about request parameters   | `@Autowired`<br>`ParameterInfo paramInfo;`
| [Messages](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/messages/Messages.html)  | Interface to write messages | `@Autowired`<br>`Messages messages;`
| [FeatureTogglesInfo](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/request/FeatureTogglesInfo.html)  | Information about feature toggles | `@Autowired`<br>`FeatureTogglesInfo ftsInfo;`
| [CdsDataStore](https://javadoc.io/doc/com.sap.cds/cds4j-api/latest/com/sap/cds/CdsDataStore.html) | Direct access to default data store | `@Autowired`<br>`CdsDataStore ds;` |


## Minimum Dependency Versions

The CAP Java SDK uses various dependencies that are also used by the applications themselves. If the applications decide to manage versions of these dependencies it is helpful to know the minimum versions of these dependencies that the CAP Java SDK requires. The following table lists these minimum versions for various common dependencies, based on the latest release.

### Active Version 2.x { #dependencies-version-2 }

| Dependency | Minimum Version | Recommended Version |
| --- | --- | --- |
| Java | 17 | 17 |
| @sap/cds-dk | 6 | latest |
| @sap/cds-compiler | 3 | latest |
| Spring Boot | 3.0 | 3.0 |
| XSUAA | 3.0 | latest |
| SAP Cloud SDK | 4.13 | latest |
| Java Logging | 3.7 | latest |

### Maintenance Version 1.34.x (LTS)

| Dependency | Minimum Version | Recommended Version |
| --- | --- | --- |
| Java | 8 | 17 |
| @sap/cds-dk | 4 | 6 |
| @sap/cds-compiler | 2 | 3 |
| Spring Boot | 2.7 | 2.7 |
| XSUAA | 2.13 | latest |
| SAP Cloud SDK | 4.10 | latest |

## Building CAP Java Applications

This section describes various options to create a CAP Java project from scratch, to build your application with Maven, and to modify an existing project with the CDS Maven plugin.

### The Maven Archetype

Use the following command line to create a project from scratch with the CDS Maven archetype:

::: code-group
```sh
mvn archetype:generate -DarchetypeArtifactId=cds-services-archetype -DarchetypeGroupId=com.sap.cds -DarchetypeVersion=RELEASE
```

```cmd
mvn archetype:generate -DarchetypeArtifactId=cds-services-archetype -DarchetypeGroupId=com.sap.cds -DarchetypeVersion=RELEASE
```

```powershell
mvn archetype:generate `-DarchetypeArtifactId=cds-services-archetype `-DarchetypeGroupId=com.sap.cds `-DarchetypeVersion=RELEASE
```
:::

<div id="release-sap" />

It supports the following command line options:

| Option | Description |
| -- | -- |
| `-DincludeModel=true` | Adds a minimalistic sample CDS model to the project |
| `-DincludeIntegrationTest=true` | Adds an integration test module to the project |
| `-DodataVersion=[v2\|v4]` | Specify which protocol adapter is activated by default |
| `-DtargetPlatform=cloudfoundry` | Adds CloudFoundry target platform support to the project |
| `-DinMemoryDatabase=[h2\|sqlite]` | Specify which in-memory database is used for local testing. If not specified, the default value is `h2`. |
| `-DjdkVersion=[17\|20]` | Specifies the target JDK version. If not specified, the default value is `17`. |

### Maven Build Options

You can build and run your application by means of the following Maven command:

```sh
mvn spring-boot:run
```

The following sections describe additional options you can apply during the build.

#### Project-Specific Configuration in _.cdsrc.json_

If you can't stick to defaults, you can use the _.cdsrc.json_ to add specific configuration to your project. The configuration is used by the build process using `@sap/cds-dk`.

[Learn more about configuration and `cds.env`](../../node.js/cds-env){.learn-more}

#### Using a specific cds-dk version

By default, the build is configured to download a Node.js runtime and the `@sap/cds-dk` tools and install them locally within the project.
The `install-cdsdk` goal requires a version of `@sap/cds-dk` which [needs to be provided explicitly](../../releases/archive/2022/oct22#important-changes-in-java) in the configuration. With this you can ensure that the build is fully reproducible.
You can provide this version by adding the following property to the `properties` section in your `pom.xml`:

```xml
<properties>
    ...
    <cds.install-cdsdk.version>FIXED VERSION</cds.install-cdsdk.version>
</properties>
```

::: tip
Make sure to regularly update `@sap/cds-dk` according to [our guidance](../../releases/schedule). For multitenant applications, ensure that the `@sap/cds-dk` version in the sidecar is in sync.
:::

#### Using a Global cds-dk

By default, the build is configured to download a Node.js runtime and the `@sap/cds-dk` tools and install them locally within the project.
This step makes the build self-contained, but the build also takes more time. You can omit these steps and speed up the Maven build, using the Maven profile `cdsdk-global`.

Prerequisites:
* `@sap/cds-dk` is [globally installed](../../get-started/jumpstart#setup).
* Node.js installation is available in current *PATH* environment.

If these prerequisites are met, you can use the profile `cdsdk-global` by executing:

```sh
mvn spring-boot:run -P cdsdk-global
```

#### Refreshing the Local cds-dk

By default, the goal `install-cdsdk` of the `cds-maven-plugin` skips the installation of the `@sap/cds-dk`, if the `@sap/cds-dk` is already installed. To update the `@sap/cds-dk` version in your application project do the following:

1. Specify a newer version of `@sap/cds-dk` in your *pom.xml* file.
1. Execute `mvn spring-boot:run` with an additional property `-Dcds.install-cdsdk.force=true`, to force the installation of a **`@sap/cds-dk`** in the configured version.

    ```sh
    mvn spring-boot:run -Dcds.install-cdsdk.force=true
    ```

::: tip _Recommendation_ <!--  -->
This should be done at least with every **major update** of `@sap/cds-dk`.
:::

### Increased developer efficiency with Spring Boot Devtools
In order to speed up your development turnaround you can add the [Spring Boot Devtools](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools) dependency to your CAP Java application. Just add this dependency to the `pom.xml` of your `srv` module:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
</dependency>
```

Once this is added, you can use the restart capabilities of the Spring Boot Devtools while developing your application in your favorite Java IDE. Any change triggers an automatic application context reload without the need to manually restart the complete application. Besides being a lot faster than the complete restart this also eliminates manual steps. The application context reload is triggered by any file change on the application's classpath:

* Java classes (e.g. custom handlers)
* Anything below src/main/resources
  * Configuration files (e.g. application.yaml)
  * Artifacts generated from CDS (schema.sql, CSN, EDMX)
  * Any other static resource

#### Spring Boot Devtools and CDS build

The Spring Boot Devtools have no knowledge of any CDS tooling or the CAP Java runtime. Thus, they can't trigger a CDS build in case of changed CDS sources. For more information, please check the [Local Development Support](#local-development-support) section.

::: tip
Especially CDS builds result in a lot of changed resources in your project. To have a smooth experience, define a [trigger file](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools.restart.triggerfile) and [use `auto-build` goal](#cds-auto-build) of the CDS Maven plugin started from the command line.
:::

### CDS Maven Plugin { #cds-maven-plugin}

CDS Maven plugin provides several goals to perform CDS-related build steps. It can be used in CAP Java projects to perform the following build tasks:

- Install Node.js in the specified version
- Install the CDS Development Kit `@sap/cds-dk` in a specified version
- Perform arbitrary CDS commands on a CAP Java project
- Generate Java classes for type-safe access
- Clean a CAP Java project from artifacts of the previous build

Since CAP Java 1.7.0, that CDS Maven Archetype sets up projects to leverage the CDS Maven plugin to perform the previous mentioned build tasks. On how to modify a project generated with a previous version of the CDS Maven Archetype, see [this commit](https://github.com/SAP-samples/cloud-cap-samples-java/commit/ceb47b52b1e30c9a3f6e0ea29e207a3dad3c0190).

See [CDS Maven Plugin documentation](../assets/cds-maven-plugin-site/plugin-info.html){target="_blank"} for more details.

### Local Development Support { #local-development-support}

#### CDS Watch
In addition to the previously mentioned build tasks, the CDS Maven plugin can also support the local development of your CAP Java application. During development, you often have to perform the same steps to test the changes in the CDS model:

1. Modify your CDS model.
1. Build and run your application.
1. Test your changes.

To automate and accelerate these steps, the `cds-maven-plugin` offers the goal `watch`, that can be executed from the command line in the service module folder by using Maven:

```sh
cd srv
mvn cds:watch
```

It builds and starts the application and looks for changes in the CDS model. If you make changes to the CDS model, these are recognized and a restart of the application is initiated to make the changes effective.

The `watch` goal uses the `spring-boot-maven-plugin` internally to start the application with the goal `run` (this also includes a CDS build). Therefore, it's required that the application is a Spring Boot application and that you execute the `watch` goal within your service module folder.
When you add the [Spring Boot Devtools](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools) to your project, the `watch` goal can take advantage of the reload mechanism described in the linked section. In case your application does not use the Spring Boot Devtools the `watch` goal performs a complete restart of the Spring Boot application after CDS model changes. As the application context reload is always faster than the complete restart the approach using the Spring Boot Devtools is the preferred approach.

::: warning
The `watch` goal only works on Windows if the Spring Boot Devtools are enabled.
:::

#### CDS Auto-Build

If you want to have the comfort of an automated CDS build like with the `watch` goal but want to control your CAP Java application from within the IDE, you can use the `auto-build` goal. This goal reacts on any CDS file change and performs a rebuild of your applications's CDS model. However, no CAP Java application is started by the goal. This doesn't depend on Spring Boot Devtools support.

::: tip
If the Spring Boot Devtools configuration of your CAP Java application defines a [trigger file](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools.restart.triggerfile), the `auto-build` can detect this and touch the trigger file in case of any file change. The same applies to the `watch` goal.
:::

<div id="afterautobuild" />

## Testing CAP Java Applications

This section describes some best practices and recommendations for testing CAP Java applications.

As described in [Modular Architecture](../architecture#modular_architecture), a CAP Java application consists of weakly coupled components, which enables you to define your test scope precisely and focus on parts that need a high test coverage.

Typical areas that require testing are the [services](../consumption-api#cdsservices) that dispatch events to [event handlers](../provisioning-api), the event handlers themselves that implement the behaviour of the services, and finally the APIs that the application services define and that are exposed to clients through [OData](../application-services#odata-requests).

::: tip
Aside from [JUnit](https://junit.org/junit5/), the [Spring framework](https://docs.spring.io/spring-framework/docs/current/reference/html/index.html) provides much convenience for both unit and integration testing, like dependency injection via [*autowiring*](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-factory-autowire) or the usage of [MockMvc](https://docs.spring.io/spring-framework/docs/current/reference/html/testing.html#spring-mvc-test-framework) and [*mocked users*]( https://docs.spring.io/spring-security/reference/servlet/test/method.html#test-method-withmockuser). So whenever possible, it is recommended to utilize it for writing tests.
:::

### Best Practices

To illustrate this, the following examples demonstrate some of the recommended ways of testing. All the examples are taken from the [CAP Java bookshop sample project](https://github.com/SAP-samples/cloud-cap-samples-java/) in a simplified form, so definitely have a look at this as well.

Let's assume you want to test the following custom event handler:

```java
@Component
@ServiceName(CatalogService_.CDS_NAME)
public class CatalogServiceHandler implements EventHandler {

    private final PersistenceService db;

    public CatalogServiceHandler(PersistenceService db) {
        this.db = db;
    }

    @On
    public void onSubmitOrder(SubmitOrderContext context) {
        Integer quantity = context.getQuantity();
        String bookId = context.getBook();

        Optional<Books> book = db.run(Select.from(BOOKS).columns(Books_::stock).byId(bookId)).first(Books.class);

        book.orElseThrow(() -> new ServiceException(ErrorStatuses.NOT_FOUND, MessageKeys.BOOK_MISSING)
            .messageTarget(Books_.class, b -> b.ID()));

        int stock = book.map(Books::getStock).get();

        if (stock >= quantity) {
            db.run(Update.entity(BOOKS).byId(bookId).data(Books.STOCK, stock -= quantity));
            SubmitOrderContext.ReturnType result = SubmitOrderContext.ReturnType.create();
            result.setStock(stock);
            context.setResult(result);
        } else {
            throw new ServiceException(ErrorStatuses.CONFLICT, MessageKeys.ORDER_EXCEEDS_STOCK, quantity);
        }
    }

    @After(event = CqnService.EVENT_READ)
    public void discountBooks(Stream<Books> books) {
        books.filter(b -> b.getTitle() != null).forEach(b -> {
            loadStockIfNotSet(b);
            discountBooksWithMoreThan111Stock(b);
        });
    }

    private void discountBooksWithMoreThan111Stock(Books b) {
        if (b.getStock() != null && b.getStock() > 111) {
            b.setTitle(String.format("%s -- 11%% discount", b.getTitle()));
        }
    }

    private void loadStockIfNotSet(Books b) {
        if (b.getId() != null && b.getStock() == null) {
            b.setStock(db.run(Select.from(BOOKS).byId(b.getId()).columns(Books_::stock)).single(Books.class).getStock());
        }
    }
}
```

::: tip
You can find a more complete sample of the previous snippet in our [CAP Java bookshop sample project](https://github.com/SAP-samples/cloud-cap-samples-java/blob/main/srv/src/main/java/my/bookshop/handlers/CatalogServiceHandler.java).
:::

The `CatalogServiceHandler` here implements two handler methods -- `onSubmitOrder` and `discountBooks` -- that should be covered by tests.

The method `onSubmitOrder` is registered to the `On` phase of a `SubmitOrder` event and basically makes sure to reduce the stock quantity of the ordered book by the order quantity, or, in case the order quantity exceeds the stock, throws a `ServiceException`.

Whereas `discountBooks` is registered to the `After` phase of a `read` event on the `Books` entity and applies a discount information to a book's title if the stock quantity is larger than 111.

#### Event Handler Layer Testing

Out of these two handler methods `discountBooks` does not actually depend on the `PersistenceService`.

That allows us to verify its behavior in a unit test by creating a `CatalogServiceHandler` instance with the help of a `PersistenceService` mock to invoke the handler method on, as demonstrated below:

::: tip
For mocking, you can use [Mockito](https://site.mockito.org/), which is already included with the `spring-boot-starter-test` "Starter".
:::

```java
@ExtendWith(MockitoExtension.class)
public class CatalogServiceHandlerTest {

    @Mock
    private PersistenceService db;

    @Test
    public void discountBooks() {
        Books book1 = Books.create();
        book1.setTitle("Book 1");
        book1.setStock(10);

        Books book2 = Books.create();
        book2.setTitle("Book 2");
        book2.setStock(200);

        CatalogServiceHandler handler = new CatalogServiceHandler(db);
        handler.discountBooks(Stream.of(book1, book2));

        Assertions.assertEquals("Book 1", book1.getTitle(), "Book 1 was discounted");
        Assertions.assertEquals("Book 2 -- 11% discount", book2.getTitle(), "Book 2 was not discounted");
    }
}
```

::: tip
You can find a variant of this sample code also in our [CAP Java bookshop sample project](https://github.com/SAP-samples/cloud-cap-samples-java/blob/main/srv/src/test/java/my/bookshop/handlers/CatalogServiceHandlerTest.java).
:::

Whenever possible, mocking dependencies and just testing the pure processing logic of an implementation allows you to ignore the integration bits and parts of an event handler, which is a solid first layer of your testing efforts.

#### Service Layer Testing

[Application Services](../application-services) that are backed by an actual service definition within the `CdsModel` implement an interface, which extends the `Service` interface and offers a common `CQN execution API` for `CRUD` events. This API can be used to run `CQN` statements directly against the service layer, which can be used for testing, too.

To verify the proper discount application in our example, we can run a `Select` statement against the `CatalogService` and assert the result as follows, using a well-known dataset:

```java{25-32}
import cds.gen.catalogservice.Books;
import cds.gen.catalogservice.Books_;
import cds.gen.catalogservice.CatalogService_;
import com.sap.cds.Result;
import com.sap.cds.ql.Select;
import com.sap.cds.services.cds.CqnService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(SpringExtension.class)
@SpringBootTest
class CatalogServiceTest {

    @Autowired
    @Qualifier(CatalogService_.CDS_NAME)
    private CqnService catalogService;

    @Test
    void discountApplied() {// [!code focus]
        Result result = catalogService.run(Select.from(Books_.class).byId("51061ce3-ddde-4d70-a2dc-6314afbcc73e"));// [!code focus]

        // book with title "The Raven" and a stock quantity of > 111// [!code focus]
        Books book = result.single(Books.class);// [!code focus]

        assertEquals("The Raven -- 11% discount", book.getTitle(), "Book was not discounted");// [!code focus]
    }//[!code focus]
}
```

As every service in CAP implements the [Service](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/Service.html) interface with its [emit(EventContext)](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/Service.html#emit-com.sap.cds.services.EventContext-) method, another way of testing an event handler is to dispatch an event context via the `emit()` method to trigger the execution of a specific handler method.

Looking at the `onSubmitOrder` method from our example above we see that it uses an event context called `SubmitOrderContext`. Therefore, using an instance of that event context, in order to test the proper stock reduction, we can trigger the method execution and assert the result, as demonstrated:

```java
@SpringBootTest
public class CatalogServiceTest {

    @Autowired
    @Qualifier(CatalogService_.CDS_NAME)
    private CqnService catalogService;

    @Test
    public void submitOrder() {
        SubmitOrderContext context = SubmitOrderContext.create();

        // ID of a book known to have a stock quantity of 22
        context.setBook("4a519e61-3c3a-4bd9-ab12-d7e0c5329933");
        context.setQuantity(2);
        catalogService.emit(context);

        Assertions.assertEquals(22 - context.getQuantity(), context.getResult().getStock());
    }
}
```

The same way you can verify the `ServiceException` being thrown in case of the order quantity exceeding the stock value:

```java
@SpringBootTest
public class CatalogServiceTest {

    @Autowired
    @Qualifier(CatalogService_.CDS_NAME)
    private CqnService catalogService;

    @Test
    public void submitOrderExceedingStock() {
        SubmitOrderContext context = SubmitOrderContext.create();

        // ID of a book known to have a stock quantity of 22
        context.setBook("4a519e61-3c3a-4bd9-ab12-d7e0c5329933");
        context.setQuantity(30);
        catalogService.emit(context);

        Assertions.assertThrows(ServiceException.class, () -> catalogService.emit(context), context.getQuantity() + " exceeds stock for book");
    }
}
```

::: tip
For a more extensive version of the previous `CatalogServiceTest` snippets, have a look at our [CAP Java bookshop sample project](https://github.com/SAP-samples/cloud-cap-samples-java/blob/main/srv/src/test/java/my/bookshop/CatalogServiceTest.java).
:::

#### API Integration Testing

Integration tests enable us to verify the behavior of a custom event handler execution doing a roundtrip starting at the protocol adapter layer and going through the whole CAP architecture until it reaches the service and event handler layer and then back again through the protocol adapter.

As the services defined in our `CDS model` are exposed as `OData` endpoints, by using [MockMvc](https://docs.spring.io/spring-framework/docs/current/reference/html/testing.html#spring-mvc-test-framework) we can simply invoke a specific `OData` request and assert the response from the addressed service.

The following demonstrates this by invoking a `GET` request to the `OData` endpoint of our `Books` entity, which triggers the execution of the `discountBooks` method of the `CatalogServiceHandler` in our example:

```java
@SpringBootTest
@AutoConfigureMockMvc
public class CatalogServiceITest {

    private static final String booksURI = "/api/browse/Books";

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void discountApplied() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get(booksURI + "?$filter=stock gt 200&top=1"))
            .andExpect(MockMvcResultMatchers.status().isOk())
            .andExpect(MockMvcResultMatchers.jsonPath("$.value[0].title").value(Matchers.containsString("11% discount")));
    }

    @Test
    public void discountNotApplied() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get(booksURI + "?$filter=stock lt 100&top=1"))
            .andExpect(MockMvcResultMatchers.status().isOk())
            .andExpect(MockMvcResultMatchers.jsonPath("$.value[0].title").value(Assertions.not(Matchers.containsString("11% discount"))));
    }
}
```

::: tip
Check out the version in our [CAP Java bookshop sample project](https://github.com/SAP-samples/cloud-cap-samples-java/blob/main/srv/src/test/java/my/bookshop/CatalogServiceITest.java) for additional examples of integration testing.
:::
