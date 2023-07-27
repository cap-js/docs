---
synopsis: >
  Persistence Services are CQN-based database clients. This section describes which database types are supported, how datasources to these databases are created and how they are turned into Persistence Services.
status: released
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/9186ed9ab00842e1a31309ff1be38792.html
---
<!--- Migrated: @external/java/persistence-services.md -> @external/java/persistence-services.md -->

# Persistence Services
<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>

{{ $frontmatter.synopsis }}
<!--- % include links.md %} -->

## Database Support { #database-support}

The CAP Java SDK has built-in support for various databases. This section describes the different databases and any differences between them with respect to CAP features. There's out of the box support for SAP HANA with CAP currently as well as H2 and SQLite. However, it's important to note that H2 and SQLite aren't an enterprise grade database and are recommended for nonproductive use like local development or CI tests only. PostgreSQL is supported in addition, but has various limitations in comparison to SAP HANA, most notably in the area of schema evolution.

### SAP HANA (Cloud)

SAP HANA is supported as the CAP standard database and recommended for productive use with needs for schema evolution and multitenancy. Some salient points to note with SAP HANA are:

1. Views are supported as described in [Resolvable Views](query-execution#updatable-views), else any operation on views are defaulted to SAP HANA, which has limitations as described in the [SAP HANA Cloud documentation](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c1d3f60099654ecfb3fe36ac93c121bb/20d5fa9b75191014a33eee92692f1702.html#loio20d5fa9b75191014a33eee92692f1702__section_trx_ckh_qdb).
2. Shared locks are supported on SAP HANA Cloud only

### PostgreSQL

CAP Java SDK is tested on [PostgreSQL](https://www.postgresql.org/) 15 and supports most of the CAP features. Known limitations are:

1. CAP can create an _initial_ database schema only. There is no automatic schema evolution.
2. No locale specific sorting. The sort order of queries behaves as configured on the database.
3. Write operations through CDS views are only supported for views that can be [resolved](query-execution#updatable-views) or are [updatable](https://www.postgresql.org/docs/14/sql-createview.html#SQL-CREATEVIEW-UPDATABLE-VIEWS) in PostgreSQL.
4. The CDS type `UInt8` can't be used with PostgreSQL, as there is no `TINYINT`. Use `Int16` instead.

### H2 Database

[H2](https://www.h2database.com/html/main.html) is one of the recommended in-memory databases for local development. There’s no production support for H2 from CAP and there are the following support limitations:

1. H2 only supports database level collation. Lexicographical sorting on character-based columns isn’t supported.
2. Case-insensitive comparison isn’t yet supported.
3. By default, views aren’t updatable on H2. However, the CAP Java SDK supports some views to be updatable as described [here](query-execution#updatable-views).
4. Although referential and foreign key constraints are supported, H2 [doesn't support deferred checking](http://www.h2database.com/html/grammar.html#referential_action). As a consequence, schema SQL is never generated with referential constraints.
5. In [pessimistic locking](query-execution#pessimistic-locking), _shared_ locks are not supported but an _exclusive_ lock is used instead.
6. The CDS type `UInt8` can't be used with H2, as there is no `TINYINT`. Use `Int16` instead.

### SQLite

CAP supports [SQLite](https://www.sqlite.org/index.html) out of the box. When working with Java, it’s [recommended](../guides/databases-sqlite?impl-variant=java#sqlite-in-production) to use SQLite only for development and testing purposes.

CAP does support most of the major features on SQLite, although there are a few shortcomings that are listed here:

1. `RIGHT` and `FULL OUTER JOIN` isn’t supported.
2. There are some known issues with parentheses in `UNION` operator. The following statement is erroneous: `SELECT * FROM A UNION ( SELECT * FROM B )`. Instead, use: `SELECT * FROM A UNION SELECT * FROM B` without parentheses. This can be achieved by removing the parentheses in your CDS Model.
3. SQLite has only limited support for concurrent database access. You’re advised to limit the connection pool to *1* as shown above (parameter `maximum-pool-size: 1`), which effectively serializes all database transactions.
4. The predicate function `contains` is supported. However, the search for characters in the word or phrase is case-insensitive in SQLite. In the future, we might provide an option to make the case-sensitivity locale dependent.
5. SQLite doesn't support [pessimistic locking](query-execution#pessimistic-locking).
6. Streaming of large object data isn’t supported by SQLite. Hence, when reading or writing data of type `cds.LargeString` and `cds.LargeBinary` as a stream the framework temporarily materializes the content. Thus, storing large objects on SQLite can impact the performance.
7. Sorting of character-based columns is never locale-specific but if any locale is specified in the context of a query then case insensitive sorting is performed.
8. Views in SQLite are read-only. However, the CAP Java SDK supports some views to be updatable as described [here](query-execution#updatable-views).
9. Foreign key constraints are supported, but disabled by default. To activate the feature using JDBC URL, append the `foreign_keys=on` parameter to the connection URL, for example, `url=jdbc:sqlite:file:testDb?mode=memory&foreign_keys=on`. For more information, visit the [SQLite Foreign Key Support](https://sqlite.org/foreignkeys.html) in the official documentation.

## Datasources

Java Applications usually connect to SQL databases through datasources (`java.sql.DataSource`).
The CAP Java SDK can auto-configure datasources from service bindings and pick up datasources configured by Spring Boot.
These datasources are used to create Persistence Services, which are CQN-based database clients.

### Datasource Configuration

Datasources are usually backed by a connection pool to ensure efficient access to the database.
If datasources are created from a service binding the connection pool can be configured through the properties `cds.dataSource.<service-instance>.<pool-type>.*`.
An example configuration could look like this:

```yaml
cds:
  dataSource:
    my-service-instance:
      hikari:
        maximum-pool-size: 20
```

Supported pool types for single tenant scenarios are `hikari`, `tomcat`, and `dbcp2`. For a multitenant scenario `hikari`, `tomcat`, and `atomikos` are supported. The corresponding pool dependencies need to be available on the classpath. You can find an overview of the available pool properties in the respective documentation of the pool. For example, properties supported by Hikari can be found [here](https://github.com/brettwooldridge/HikariCP#gear-configuration-knobs-baby).

It is also possible to configure the database connection itself. For Hikari this can be achieved by using the `data-source-properties` section. Properties defined here are passed to the respective JDBC driver, which is responsible to establish the actual database connection. The following example sets such a [SAP HANA-specific configuration](https://help.sap.com/docs/SAP_HANA_PLATFORM/0eec0d68141541d1b07893a39944924e/109397c2206a4ab2a5386d494f4cf75e.html?locale=en-US):

```yaml
cds:
  dataSource:
    my-service-instance:
      hikari:
        data-source-properties:
          packetSize: 300000
```

### SAP HANA

SAP HANA can be configured when running locally as well as when running productively in the cloud. The datasource is auto-configured based on available service bindings in the `VCAP_SERVICES` environment variable or locally the _default-env.json_. This only works if an application profile is used, that doesn’t explicitly configure a datasource using `spring.datasource.url`. Such an explicit configuration always takes precedence over service bindings from the environment.

Service bindings of type *service-manager* and, in a Spring-based application, *hana* are used to auto-configure datasources. If multiple datasources are used by the application, you can select one auto-configured datasource to be used by the default Persistence Service through the property `cds.dataSource.binding`.

### PostgreSQL

CAP Java provides limited support for [PostgreSQL](https://www.postgresql.org/). The major limitation is that CAP can only create an _initial_ database schema but there is no automatic schema evolution.

#### Initial Database Schema

To generate a `schema.sql` for PostgreSQL, use the dialect `postgres` with the `cds deploy` command: `cds deploy --to postgres --dry`. The following snippet from _srv/pom.xml_ configures the [cds-maven-plugin](../java/development/#cds-maven-plugin) accordingly:

```xml
<execution>
	<id>cds</id>
	<goals>
		<goal>cds</goal>
	</goals>
	<configuration>
		<commands>
			<command>deploy --to postgres --dry > srv/src/main/resources/schema.sql</command>
		</commands>
	</configuration>
</execution>
```

The generated `schema.sql` can be automatically deployed by Spring if you configure the [sql.init.mode](https://docs.spring.io/spring-boot/docs/2.7.x/reference/html/howto.html#howto.data-initialization.using-basic-sql-scripts) to `always`.
::: warning
Automatic schema deployment is not suitable for productive use. Consider using production-ready tools like Flyway or Liquibase.
:::

#### Configure the PostgreSQL Database

Configure the connection data of your PostgreSQL database in the _application.yaml_:

```yaml
---
spring:
  profiles: postgres
  datasource:
    url: <url>
    username: <user>
    password: <password>
    driver-class-name: org.postgres.Driver
```

### H2

For local development, [H2](https://www.h2database.com/) can be configured to run in-memory or in the file-based mode.

To generate a `schema.sql` for H2, use the dialect `h2` with the `cds deploy` command: `cds deploy --to h2 --dry`. The following snippet from _srv/pom.xml_ configures the [cds-maven-plugin](../java/development/#cds-maven-plugin) accordingly:

```xml
<execution>
	<id>cds</id>
	<goals>
		<goal>cds</goal>
	</goals>
	<configuration>
		<commands>
			<command>deploy --to h2 --dry > srv/src/main/resources/schema.sql</command>
		</commands>
	</configuration>
</execution>
```

In Spring, H2 is automatically initialized in-memory when present on the classpath. See the official [documentation](http://www.h2database.com/html/features.html) for H2 for file-based database configuration.

### SQLite

#### Initial Database Schema

To generate a `schema.sql` for SQLite, use the dialect `sqlite` with the `cds deploy` command: `cds deploy --to sqlite --dry`. The following snippet from _srv/pom.xml_ configures the [cds-maven-plugin](../java/development/#cds-maven-plugin) accordingly:

```xml
<execution>
	<id>cds</id>
	<goals>
		<goal>cds</goal>
	</goals>
	<configuration>
		<commands>
			<command>deploy --to sqlite --dry > srv/src/main/resources/schema.sql</command>
		</commands>
	</configuration>
</execution>
```

Also, you need to enable compiler support for session context variables in _.cdsrc.json_:

```json
{"cdsc": { "betterSqliteSessionVariables": true }}
```

#### File-Based Storage

The database content is stored in a file, `sqlite.db` as in the following example. Since the schema is initialized using `cds deploy` command, the initialization mode is set to `never`:

```yaml
---
spring:
  profiles: sqlite
  sql:
    init:
      mode: never
  datasource:
    url: "jdbc:sqlite:sqlite.db"
    driver-class-name: org.sqlite.JDBC
    hikari:
      maximum-pool-size: 1
cds:
  sql:
    supportedLocales: "*"
```

#### In-Memory Storage

The database content is stored in-memory only. The schema initialization done by Spring, executes the `schema.sql` script. Hence, the initialization mode is set to `always`. If Hikari closes the last connection from the pool, the in-memory database is automatically deleted. To prevent this situation, set `max-lifetime` to *0*:


```yaml
---
spring:
  profiles: default
  sql:
    init:
      mode: always
  datasource:
    url: "jdbc:sqlite:file::memory:?cache=shared"
    driver-class-name: org.sqlite.JDBC
    hikari:
      maximum-pool-size: 1
      max-lifetime: 0
cds:
  sql:
    supportedLocales: "*"
```

## Persistence Services

Persistence Services are CQN-based database clients. You can think of them as a wrapper around a datasource, which translates CQN to SQL.
In addition Persistence Services have built-in transaction management. They take care of lazily initializing and maintaining database transactions as part of the active changeset context.

[Learn more about ChangeSet Contexts and Transactions.](changeset-contexts){.learn-more}

A Persistence Service isn't bound to a specific service definition in the CDS model. It's capable of accepting CQN statements targeting any entity or view that is stored in the corresponding database.
All Persistence Service instances reflect on the same CDS model. It is the responsibility of the developer to decide which artifacts are deployed into which database at deploy time and to access these artifacts with the respective Persistence Service at runtime.

### The Default Persistence Service { #default-persistence-service}

The default Persistence Service is used by the generic handlers of Application Services to offer out-of-the-box CRUD functionality.
The name of the default Persistence Service is stored in the global constant [`PersistenceService.DEFAULT_NAME`](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/persistence/PersistenceService.html#DEFAULT_NAME).

If only a single datasource exists in the application the CAP Java SDK creates the default Persistence Service from it.
This is usually the case when specifying a datasource through Spring Boot's configuration (`spring.datasource.url` or auto-configured H2) or when having a single database service binding.

If multiple datasources exist in the application, the CAP Java SDK needs to know for which the default Persistence Service should be created, otherwise the application startup will fail.
By setting the property `cds.dataSource.binding` the datasource created from the specified database service binding is marked as primary.
If the datasource to be used is directly created as a bean in Spring Boot you need to ensure to mark it as primary using Spring Boot's `@Primary` annotation.

### Additional Persistence Services

For each non-primary database service binding a Persistence Service is automatically created. The name of the Persistence Service is the name of the service binding.
It is possible to configure how Persistence Services are created.

To change the name of a Persistence Service you can specify it in your configuration and connect it explicitly with the corresponding database service binding.
The following configuration creates a Persistence Service named "my-ps" for the service binding "my-hana-hdi":

```yaml
cds:
  persistence.services:
    my-ps:
      binding: "my-hana-hdi"
```

You can also disable the creation of a Persistence Service for specific database service bindings.
The following configuration disables the creation of a Persistence Service for the service binding "my-hana-hdi":

```yaml
cds:
  persistence.services:
    my-hana-hdi:
      enabled: false
```

To create a non-default Persistence Service for a datasource explicitly created as Spring bean a configuration is required.
The following examples shows a Java example to register such a datasource bean:

```java
@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource customDataSource() {
        return DataSourceBuilder.create()
            .url("jdbc:sqlite:sqlite.db")
            .build();
    }

}
```

In the configuration you need to refer to the name of the datasource:

```yaml
cds:
  persistence.services:
    my-ps:
      dataSource: "customDataSource"
```
::: tip
Any usage of non-default Persistence Services needs to happen in custom handlers.
:::

### Example: Multitenant Application with Tenant-independent Datasource

A common scenario for multiple Persistence Services is in multitenant applications, which require an additional tenant-independent database.
These applications usually use the Service Manager to maintain a dedicated SAP HANA HDI container for each tenant.
However additional tenant-independent data needs to be stored in a separate HDI container, shared by all tenants.

When running such a scenario productively it is as easy as binding two database service bindings to your application: The Service Manager binding and the additional HDI container binding.
The only configuration required in that scenario is to mark the Service Manager binding as the primary one, in order to create the default Persistence Service from it:

```yaml
spring:
  config.activate.on-profile: cloud
cds:
  dataSource:
    binding: "my-service-manager-binding"
```

At deploy time it is currently recommended to deploy all CDS entities into both the tenant-dependent as well as the tenant-independent databases.
At runtime you need to ensure to access the tenant-dependent entities through the default Persistence Service and the tenant-independent entities through the additional Persistence Service.

#### Local Development and Testing with MTX

In case you are testing your multitenant application locally with the setup described in [Local Development and Testing](../guides/deployment/as-saas?impl-variant=java#local-mtx) of the "Deploy as Multitenant SaaS Application" cookbook you need to perform additional steps to create an in-memory tenant-independent datasource.

To create an in-memory datasource, initialized with the SQL schema, add the following configuration to your Spring Boot application:

```java
@Configuration
public class DataSourceConfig {

    @Bean
    @ConfigurationProperties("app.datasource.tenant-independent")
    public DataSourceProperties tenantIndependentDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    public DataSource tenantIndependentDataSource() {
        return tenantIndependentDataSourceProperties()
            .initializeDataSourceBuilder()
            .build();
    }

    @Bean
    public DataSourceInitializer tenantIndependentInitializer() {
        ResourceDatabasePopulator resourceDatabasePopulator = new ResourceDatabasePopulator();
        resourceDatabasePopulator.addScript(new ClassPathResource("schema.sql"));

        DataSourceInitializer dataSourceInitializer = new DataSourceInitializer();
        dataSourceInitializer.setDataSource(tenantIndependentDataSource());
        dataSourceInitializer.setDatabasePopulator(resourceDatabasePopulator);
        return dataSourceInitializer;
    }

}
```

You can then refer to that datasource in your Persistence Service configuration and mark the auto-configured MTX SQLite datasource as primary:

```yaml
spring:
  config.activate.on-profile: local-mtxs
cds:
  persistence.services:
    tenant-independent:
      dataSource: "tenantIndependentDataSource"
  dataSource:
    binding: "mtx-sqlite"
```

#### Local Development and Testing without MTX

In case you're testing your application in single-tenant mode without MTX sidecar you need to configure two in-memory databases.
The primary one is used for your tenant-dependant persistence and the secondary one for your tenant-independent persistence.

Due to the way the Spring Boot DataSource auto-configuration works, you can't use the configuration property `spring.datasource.url` for one of your datasources.
Spring Boot doesn't pick up this configuration anymore, as soon as you explicitly define another datasource, which is required in this scenario.

You therefore need to define the configuration for two datasources. In addition, you need to define the transaction manager for the primary datasource.

```java
@Configuration
public class DataSourceConfig {

    /**
     * Configuration of tenant-dependant persistence
     */

    @Bean
    @Primary
    @ConfigurationProperties("app.datasource.tenant-dependent")
    public DataSourceProperties tenantDependentDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    @Primary
    public DataSource tenantDependentDataSource() {
        return tenantDependentDataSourceProperties()
            .initializeDataSourceBuilder()
            .build();
    }

    @Bean
    @Primary
    public DataSourceTransactionManager tenantDependentTransactionManager() {
        return new DataSourceTransactionManager(tenantDependentDataSource());
    }

    /**
     * Configuration of tenant-independent persistence
     */

    @Bean
    @ConfigurationProperties("app.datasource.tenant-independent")
    public DataSourceProperties tenantIndependentDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    public DataSource tenantIndependentDataSource() {
        return tenantIndependentDataSourceProperties()
            .initializeDataSourceBuilder()
            .build();
    }

    @Bean
    public DataSourceInitializer tenantIndependentInitializer() {
        ResourceDatabasePopulator resourceDatabasePopulator = new ResourceDatabasePopulator();
        resourceDatabasePopulator.addScript(new ClassPathResource("schema.sql"));

        DataSourceInitializer dataSourceInitializer = new DataSourceInitializer();
        dataSourceInitializer.setDataSource(tenantIndependentDataSource());
        dataSourceInitializer.setDatabasePopulator(resourceDatabasePopulator);
        return dataSourceInitializer;
    }

}
```

The primary datasource is automatically picked up by the CAP Java SDK. The secondary datasource needs to be referred in your Persistence Service configuration:

```yaml
spring:
  config.activate.on-profile: local
cds:
  persistence.services:
    tenant-independent:
      dataSource: "tenantIndependentDataSource"
```
