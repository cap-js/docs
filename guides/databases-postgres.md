---
status: released
impl-variants: true
---

# Using PostgreSQL

<div markdown="1" class="impl node">

This guide focuses on the new PostgreSQL Service provided through *[@cap-js/postgres](https://www.npmjs.com/package/@cap-js/postgres)*, which is based on the same new database services architecture as the new [SQLite Service](databases-sqlite). This architecture brings significantly enhanced feature sets and feature parity, as documented in the [*Features* section of the SQLite guide](databases-sqlite#features).

*Learn about migrating from the former `cds-pg` in the [Migration](#migration) chapter.*{.learn-more}

</div>

<div markdown="1" class="impl java">

CAP Java SDK is tested on [PostgreSQL](https://www.postgresql.org/) 15. Most CAP features are supported on PostgreSQL.

[Learn more about features and limitations of using CAP with PostgreSQL](../java/cqn-services/persistence-services#postgresql){.learn-more}

</div>

<ImplVariantsHint />

[[toc]]


## Setup & Configuration

<div markdown="1" class="impl node">

Run this to use [PostgreSQL](https://www.postgresql.org/) for production:

</div>

<div markdown="1" class="impl java">

To run CAP Java on PostgreSQL, add a Maven dependency to the PostgreSQL feature in `srv/pom.xml`:

```xml
<dependency>
    <groupId>com.sap.cds</groupId>
    <artifactId>cds-feature-postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

In order to use the CDS tooling with PostgreSQL, you also need to install the module `@cap-js/postgres`:

</div>

```sh
npm add @cap-js/postgres
```

To use the 

<div markdown="1" class="impl java">

After that, you can use the `cds deploy` command to [deploy](#using-cds-deploy) to a PostgreSQL database or to [create a DDL script](#deployment-using-liquibase) for PostgreSQL.

</div>

### Auto-Wired Configuration {.impl .node}

The `@cap-js/postgres` package uses `cds-plugin` technique to auto-configure your application and use a PostgreSQL database for production.

You can inspect the effective configuration using `cds env`:

```sh
cds env requires.db --for production
```

Output:

```js
{
  impl: '@cap-js/postgres',
  dialect: 'postgres',
  kind: 'postgres'
}
```

[See also the general information on installing database packages](databases#setup-configuration){.learn-more}

## Provisioning a DB Instance

To connect to a PostgreSQL offering from the cloud provider in Production, leverage the [PostgreSQL on SAP BTP, hyperscaler option](https://discovery-center.cloud.sap/serviceCatalog/postgresql-hyperscaler-option).

For local development and testing convenience, you can run PostgreSQL in a [docker container](#using-docker).

<div markdown="1" class="impl java">

There are some limitations on the BTP to consume a PostgreSQL instance:
- Only the Java buildpack `java_buildpack` provided by the Cloudfoundry community supports PostgreSQL. To use this buildpack, configure it in the service module section of your mta.yaml:

```yaml
modules:
  - name: bookshop-pg-srv
    type: java
    path: srv
    parameters:
      buildpack: java_buildpack
```

- By default the Java buildack initializes the PostgreSQL datasource with the CF Env Java library, but it's required to let the CAP Java runtime to initialize the PostgreSQL datasource. This can be achieved by setting the environment variable `CFENV_SERVICE_<PG_SERVICE_NAME>_ENABLED` to `false`. The variable `<PG_SERVICE_NAME>` needs to be replaced with the real service instance name of your PostgreSQL database.

Here an example showing both configuration settings applied to mta.yaml:
```yaml 
modules:
  - name: bookshop-pg-srv
    type: java
    path: srv
    parameters:
      buildpack: java_buildpack
    properties:
        SPRING_PROFILES_ACTIVE: cloud
        JBP_CONFIG_COMPONENTS: '{jres: ["JavaBuildpack::Jre::SapMachineJRE"]}'
        JBP_CONFIG_SAP_MACHINE_JRE: '{ jre: { version: "17.+" } }'
        # We do not want cfenv to configure the DataSource for us
        # cfenv uses names of the services, so this variable must be adapted if needed
        # as CFENV_SERVICE_[service-name]_ENABLED
        # See https://docs.cloudfoundry.org/buildpacks/java/configuring-service-connections.html
        CFENV_SERVICE_BOOKSHOP-PG-DB_ENABLED: false
```

### Using Docker

You can use Docker to run a PostgreSQL database locally as follows:

1. Install and run [Docker Desktop](https://www.docker.com)

2. Create the following file in your project root directory:
   ::: code-group

   ```yaml [pg.yml]
   services:
     db:
       image: postgres:alpine
       environment: { POSTGRES_PASSWORD: postgres }
       ports: [ '5432:5432' ]
       restart: always
   ```

   :::

3. Create and run the docker container:

   ```sh
   docker-compose -f pg.yml up -d
   ```

<div markdown="1" class="impl java">

::: tip
With the introduction of [Testcontainers support](https://spring.io/blog/2023/06/23/improved-testcontainers-support-in-spring-boot-3-1) in Spring Boot 3.1, you can create PostgreSQL containers on the fly for local development or testing purposes.
:::

</div>

## Service Bindings

You need a service binding to connect to the PostgreSQL database.

In the cloud, use given techniques to bind a cloud-based instance of PostgreSQL to your application.

<div markdown="1" class="impl node">

For local development provide the credentials using a suitable [`cds env`](../node.js/cds-env) technique, like one of the following.

</div>

### Configure Connection Data {.impl .java}

If a PostgreSQL service binding exists, the corresponding `DataSource` is auto-configured.

You can also explicitly [configure the connection data](../java/cqn-services/persistence-services#postgres-connection) of your PostgreSQL database in the _application.yaml_ file.
If you run the PostgreSQL database in a [docker container](#using-docker) your connection data might look like this:

```yaml
spring:
  config.activate.on-profile: postgres-docker
  datasource:
    url: jdbc:postgresql://localhost:5432/postgres
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver
```
To start the application with the new profile `postgres-docker`, the `spring-boot-maven-plugin` can be used: `mvn spring-boot:run -Dspring-boot.run.profiles=postgres-docker`.
Learn more about the [configuration of a PostgreSQL database](../java/cqn-services/persistence-services#postgresql-1){ .learn-more}

### Service Bindings for CDS Tooling {.impl .java}

#### Using Defaults with `[pg]` Profile {.impl .java}

`@cds-js/postgres` comes with a set of default credentials under the profile `[pg]` that matches the defaults used in the [docker setup](#using-docker). So, if you stick to these defaults you can skip to deploying your database with:

```sh
cds deploy --profile pg
```

#### In Your Private `.cdsrc-private.json` {.impl .java}

If you don't use the default credentials and want to use just `cds deploy`, you need to configure the service bindings (connection data) for the CDS tooling. Add the connection data to your private `.cdsrc-private.json`:

```json
{
  "requires": {
    "db": {
      "kind": "postgres",
      "credentials": {
        "host": "localhost",
        "port": 5432,
        "user": "postgres",
        "password": "postgres",
        "database": "postgres"
      }
    }
  }
}
```

### Configure Service Bindings {.impl .node}

#### Using Defaults with `[pg]` Profile

The `@cds-js/postgres` comes with default credentials under profile `[pg]` that match the defaults used in the [docker setup](#using-docker). So, in case you stick to these defaults you can skip the next sections and just go ahead, deploy your database:

```sh
cds deploy --profile pg
```

Run your application:

```sh
cds watch --profile pg
```

Learn more about that in the [Deployment](#deployment) chapter below.{.learn-more}



#### In Your private `~/.cdsrc.json`

Add it to your private `~/.cdsrc.json` if you want to use these credentials on your local machine only:

::: code-group

```json [~/.cdsrc.json]
{
  "requires": {
    "db": {
      "[pg]": {
        "kind": "postgres",
        "credentials": {
          "host": "localhost", "port": 5432,
          "user": "postgres",
          "password": "postgres",
          "database": "postgres"
        }
      }
    }
  }
}
```

:::

#### In Project `.env` Files

Alternatively, use a `.env` file in your project's root folder if you want to share the same credentials with your team:

::: code-group

```properties [.env]
cds.requires.db.[pg].kind = postgres
cds.requires.db.[pg].credentials.host = localhost
cds.requires.db.[pg].credentials.port = 5432
cds.requires.db.[pg].credentials.user = postgres
cds.requires.db.[pg].credentials.password = postgres
cds.requires.db.[pg].credentials.database = postgres
```

:::

::: tip Using Profiles

The previous configuration examples use the [`cds.env` profile](../node.js/cds-env#profiles) `[pg]` to allow selectively testing with PostgreSQL databases from the command line as follows:

```sh
cds watch --profile pg
```

The profile name can be freely chosen, of course.

:::



## Deployment

### Using `cds deploy`

Deploy your database as usual with that:

```sh
cds deploy
```

Or with that if you used profile `[pg]` as introduced in the setup chapter above:

```sh
cds deploy --profile pg
```

### With a Deployer App

When deploying to Cloud Foundry, this can be accomplished by providing a simple deployer app. Similar to SAP HANA deployer apps, it is auto-generated for PostgreSQL-enabled projects by running

```sh
cds build
```

::: details What `cds build` does…
1. Compiles the model into _gen/pg/db/csn.json_.
2. Copies required `.csv` files into _gen/pg/db/data_.
3. Adds a _gen/pg/package.json_ with this content:
   ```json
   {
     "dependencies": {
       "@sap/cds": "^7",
       "@cap-js/postgres": "^1"
     },
     "scripts": {
       "start": "cds-deploy"
     }
   }
   ```

> **Note the dash in `cds-deploy`**, which is required as we don't use `@cds-dk` for deployment and runtime, so the `cds` CLI executable isn't available.
:::


### Add Postgres Deployment Configuration

```sh
cds add postgres
```

::: details See what this does…
1. Adds `@cap-js/postgres` dependency to your _package.json_ `dependencies`.
2. Sets up deployment descriptors such as _mta.yaml_ to use a PostgreSQL instance deployer application.
3. Wires up the PostgreSQL service to your deployer app and CAP backend.
:::

### Deploy

You can package and deploy that application, for example using [MTA-based deployment](deployment/to-cf#build-mta).

## Automatic Schema Evolution { #schema-evolution }

When redeploying after you changed your CDS models, like adding fields, automatic schema evolution is applied. Whenever you  run `cds deploy` (or `cds-deploy`) it executes these steps:

1. Read a CSN of a former deployment from table `cds_model`.
2. Calculate the **delta** to current model.
3. Generate and run DDL statements with:
   - `CREATE TABLE` statements for new entities
   - `CREATE VIEW` statements for new views
   - `ALTER TABLE` statements for entities with new or changed elements
   - `DROP & CREATE VIEW` statements for views affected by changed entities
4. Fill in initial data from provided _.csv_ files using `UPSERT` commands.
5. Store a CSN representation of the current model in `cds_model`.


> You can disable automatic schema evolution, if necessary, by setting `cds.requires.db.schema_evolution = false`.

### Limitations

Automatic schema evolution only allows changes without potential data loss.

#### Allowed{.good}

- Adding entities and elements
- Increasing the length of Strings
- Increasing the size of Integers

#### Disallowed{.bad}

- Removing entities or elements
- Changes to primary keys
- All other type changes

For example the following type changes are allowed:

```cds
entity Foo {
   anInteger : Int64;     // from former: Int32
   aString : String(22);  // from former: String(11)
}
```

::: tip

If you need to apply such disallowed changes during development, just drop and re-create your database, for example by killing it in docker and re-create it using the `docker-compose` command, [see Using Docker](#using-docker).

:::



### Dry-Run Offline

We can use `cds deploy` with option `--dry` to simulate and inspect how things work.

1. Capture your current model in a CSN file:

   ```sh
   cds deploy --dry --model-only > cds-model.csn
   ```

2. Change your models, for example in *[cap/samples/bookshop/db/schema.cds](https://github.com/SAP-samples/cloud-cap-samples/blob/main/bookshop/db/schema.cds)*:

   ```cds
   entity Books { ...
      title : localized String(222); //> increase length from 111 to 222
      foo : Association to Foo;      //> add a new relationship
      bar : String;                  //> add a new element
   }
   entity Foo { key ID: UUID }       //> add a new entity
   ```

3. Generate delta DDL script:

   ```sh
   cds deploy --dry --delta-from cds-model.csn > delta.sql
   ```

4. Inspect the generated SQL script, which should look like this:
   ::: code-group

   ```sql [delta.sql]
   -- Drop Affected Views
   DROP VIEW localized_CatalogService_ListOfBooks;
   DROP VIEW localized_CatalogService_Books;
   DROP VIEW localized_AdminService_Books;
   DROP VIEW CatalogService_ListOfBooks;
   DROP VIEW localized_sap_capire_bookshop_Books;
   DROP VIEW CatalogService_Books_texts;
   DROP VIEW AdminService_Books_texts;
   DROP VIEW CatalogService_Books;
   DROP VIEW AdminService_Books;

   -- Alter Tables for New or Altered Columns
   ALTER TABLE sap_capire_bookshop_Books ALTER title TYPE VARCHAR(222);
   ALTER TABLE sap_capire_bookshop_Books_texts ALTER title TYPE VARCHAR(222);
   ALTER TABLE sap_capire_bookshop_Books ADD foo_ID VARCHAR(36);
   ALTER TABLE sap_capire_bookshop_Books ADD bar VARCHAR(255);

   -- Create New Tables
   CREATE TABLE sap_capire_bookshop_Foo (
     ID VARCHAR(36) NOT NULL,
     PRIMARY KEY(ID)
   );

   -- Re-Create Affected Views
   CREATE VIEW AdminService_Books AS SELECT ... FROM sap_capire_bookshop_Books AS Books_0;
   CREATE VIEW CatalogService_Books AS SELECT ... FROM sap_capire_bookshop_Books AS Books_0 LEFT JOIN sap_capire_bookshop_Authors AS author_1 O ... ;
   CREATE VIEW AdminService_Books_texts AS SELECT ... FROM sap_capire_bookshop_Books_texts AS texts_0;
   CREATE VIEW CatalogService_Books_texts AS SELECT ... FROM sap_capire_bookshop_Books_texts AS texts_0;
   CREATE VIEW localized_sap_capire_bookshop_Books AS SELECT ... FROM sap_capire_bookshop_Books AS L_0 LEFT JOIN sap_capire_bookshop_Books_texts AS localized_1 ON localized_1.ID = L_0.ID AND localized_1.locale = session_context( '$user.locale' );
   CREATE VIEW CatalogService_ListOfBooks AS SELECT ... FROM CatalogService_Books AS Books_0;
   CREATE VIEW localized_AdminService_Books AS SELECT ... FROM localized_sap_capire_bookshop_Books AS Books_0;
   CREATE VIEW localized_CatalogService_Books AS SELECT ... FROM localized_sap_capire_bookshop_Books AS Books_0 LEFT JOIN localized_sap_capire_bookshop_Authors AS author_1 O ... ;
   CREATE VIEW localized_CatalogService_ListOfBooks AS SELECT ... FROM localized_CatalogService_Books AS Books_0;
   ```

   :::

   > **Note:** If you use SQLite, ALTER TYPE commands are not necessary and so, are not supported, as SQLite is essentially typeless.

## Deployment Using Liquibase  { .impl .java }

You can also use [Liquibase](https://www.liquibase.org/) to control when, where, and how database changes are deployed. Liquibase lets you define database changes [in an SQL file](https://docs.liquibase.com/change-types/sql-file.html), use `cds deploy` to quickly generate DDL scripts which can be used by Liquibase.

Add a Maven dependency to Liquibase in `srv/pom.xml`:

```xml
<dependency>
    <groupId>org.liquibase</groupId>
    <artifactId>liquibase-core</artifactId>
    <scope>runtime</scope>
</dependency>
```

Once `liquibase-core` is on the classpath, [Spring runs database migrations](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-initialization.migration-tool.liquibase) automatically on application startup and before your tests run.

### ① Initial Schema Version

Once you're ready to release an initial version of your database schema, you can create a DDL file that defines the initial database schema. Create a `db/changelog` subfolder under `srv/src/main/resources`, place the Liquibase _change log_ file as well as the DDL scripts for the schema versions here. The change log is defined by the [db/changelog/db.changelog-master.yml](https://docs.liquibase.com/concepts/changelogs/home.html) file:

```yml
databaseChangeLog:
   - changeSet:
       id: 1
       author: me
       changes:
       - sqlFile:
           dbms: postgresql
           path: db/changelog/v1/model.sql
```

Use `cds deploy` to create the _v1/model.sql_ file:

```sh
cds deploy --profile pg --dry > srv/src/main/resources/db/changelog/v1/model.sql
```
Finally, store the CSN file, which corresponds to this schema version:

```sh
cds deploy --model-only --dry > srv/src/main/resources/db/changelog/v1/model.csn
```

The CSN file is needed as an input to compute the delta DDL script for the next change set.

If you start your application with `mvn spring-boot:run` Liquibase initializes the database schema to version `v1`, unless it has already been initialized.

::: warning
Don't change the _model.sql_ after it has been deployed by Liquibase as the [checksum](https://docs.liquibase.com/concepts/changelogs/changeset-checksums.html) of the file is validated. These files should be checked into your version control system. Follow step ② to make changes.
:::

### ② Schema Evolution { #schema-evolution-with-liquibase }

If changes of the CDS model require changes on the database, you can create a new change set that captures the necessary changes.

Use `cds deploy` to compute the delta DDL script based on the previous model versions (_v1/model.csn_) and the current model. Write the diff into a _v2/delta.sql_ file:

```sh
cds deploy --profile pg --dry --delta-from srv/src/main/resources/db/changelog/v1/model.csn > \
                                           srv/src/main/resources/db/changelog/v2/model.sql
```

Next, add a corresponding change set in the _changelog/db.changelog-master.yml_ file:

```yml
databaseChangeLog:
   - changeSet:
       id: 1
       author: me
       changes:
       - sqlFile:
           dbms: postgresql
           path: db/changelog/v1/model.sql
   - changeSet:
       id: 2
       author: me
       changes:
       - sqlFile:
           dbms: postgresql
           path: db/changelog/v2/model.sql
```

Finally, store the CSN file, which corresponds to this schema version:

```sh
cds deploy --model-only --dry > srv/src/main/resources/db/changelog/v2/model.csn
```

If you now start the application, Liquibase executes all change sets, which haven't yet been deployed to the database.

For further schema versions, repeat step ②.

::: info Only compatible changes

A delta DDL script is only produced for changes without potential data loss.
If the changes in the model could lead to data loss, an error is raised.

:::

## Migration { .impl .node }

Thanks to CAP's database-agnostic cds.ql API, we're confident that the new PostgreSQL service comes without breaking changes. Nevertheless, please check the instructions in the [SQLite Migration guide](databases-sqlite#migration), with by and large applies also to the new PostgreSQL service.

### `cds deploy --model-only`

Not a breaking change, but definitely required to migrate former `cds-pg` databases, is to prepare it for schema evolution.

To do so run `cds deploy` once with the `--model-only` flag:

```sh
cds deploy --model-only
```

This will...:

- Create the `cds_model` table in your database.
- Fill it with the current model obtained through `cds compile '*'`.

::: warning IMPORTANT:

Your `.cds` models are expected to reflect the deployed state of your database.

:::

### With Deployer App

When you have a SaaS application, upgrade all your tenants using the [deployer app](#with-deployer-app) with CLI option `--model-only` added to the start script command of your *package.json*. After having done that, don't forget to remove the `--model-only` option from the start script, to activate actual schema evolution.



## MTX Support

::: warning

[Multitenancy](../guides/multitenancy/) and [extensibility](../guides/extensibility/) aren't yet supported on PostgreSQL.

:::
