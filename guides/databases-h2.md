---
status: released
impl-variants: true
---



# Using H2 for Development in CAP Java

For local development and testing, CAP Java supports the [H2](https://www.h2database.com/) database, which can be configured to run in-memory.

[Learn more about features and limitations of using CAP with H2](../java/cqn-services/persistence-services#h2){.learn-more}

<div class="impl node">

::: warning
Not supported for CAP Node.js.
:::

</div>


<div class="impl java">

[[toc]]

</div>

## Setup & Configuration {.impl .java}

### Using the Maven Archetype {.impl .java}

When a new CAP Java project is created with the [Maven Archetype](../java/development/#the-maven-archetype) or with `cds init`,
H2 is automatically configured as in-memory database used for development and testing in the `default` profile.

### Manual Configuration {.impl .java}

To use H2, just add a Maven dependency to the H2 JDBC driver:

```xml
<dependency>
  <groupId>com.h2database</groupId>
  <artifactId>h2</artifactId>
  <scope>runtime</scope>
</dependency>
```

Next, configure the build to [create an initial _schema.sql_ file](../java/cqn-services/persistence-services#initial-database-schema-1) for H2 using `cds deploy --to h2 --dry`.

In Spring, H2 is automatically initialized as in-memory database when the driver is present on the classpath.

[Learn more about the configuration of H2 ](../java/cqn-services/persistence-services#h2){.learn-more}

## Features {.impl .java}

CAP supports most of the major features on H2:

* [Path Expressions](../java/working-with-cql/query-api#path-expressions) & Filters
* [Expands](../java/working-with-cql/query-api#projections)
* [Localized Queries](../guides/localized-data#read-operations)
* [Comparison Operators](../java/working-with-cql/query-api#comparison-operators)
* [Predicate Functions](../java/working-with-cql/query-api#predicate-functions)

[Learn about features and limitations of H2](../java/cqn-services/persistence-services#h2){.learn-more}
