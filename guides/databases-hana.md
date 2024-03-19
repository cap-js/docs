---
status: released
impl-variants: true
---

# Using SAP HANA Cloud for Production

::: info This guide is available for Node.js and Java.
Press <kbd>v</kbd> to switch, or use the toggle.
:::

[[toc]]


[SAP HANA Cloud](https://www.sap.com/products/technology-platform/hana.html) is supported as the CAP standard database and recommended for productive use with full support for schema evolution and multitenancy.

::: warning

CAP isn't validated with other variants of SAP HANA, like "SAP HANA Database as a Service" or "SAP HANA (on premise)".

:::

## Setup & Configuration

<div markdown="1" class="impl node">

Run this to use SAP HANA Cloud for production:

```sh
npm add @sap/cds-hana
```

::: details Using other SAP HANA drivers...

Package `@sap/cds-hana` uses the [`hdb`](https://www.npmjs.com/package/hdb) driver by default. You can override that by running [`npm add @sap/hana-client`](https://www.npmjs.com/package/@sap/hana-client), thereby adding it to your package dependencies, which then takes precedence over the default driver.

:::

::: tip Prefer `cds add`

... as documented in the [deployment guide](deployment/to-cf#_1-using-sap-hana-database), which also does the equivalent of `npm add @sap/cds-hana` but in addition cares for updating `mta.yaml` and other deployment resources.

:::

</div>

<div markdown="1" class="impl java">

To use SAP HANA Cloud, [configure a module](../java/architecture#module-configuration), which includes the feature `cds-feature-hana`.
For example, add a Maven runtime dependency to the `cds-feature-hana` feature:

```xml
<dependency>
  <groupId>com.sap.cds</groupId>
  <artifactId>cds-feature-hana</artifactId>
  <scope>runtime</scope>
</dependency>
```

::: tip

The [modules](../java/architecture#standard-modules) `cds-starter-cloudfoundry` and `cds-starter-k8s` include `cds-feature-hana`.

:::

The datasource for HANA is then auto-configured based on available service bindings of type *service-manager* and *hana*.

Learn more about the [configuration of an SAP HANA Cloud Database](../java/persistence-services#sap-hana){ .learn-more}

</div>



## Running `cds build`

Deployment to SAP HANA is done via the [SAP HANA Deployment Infrastructure (HDI)](https://help.sap.com/docs/HANA_CLOUD_DATABASE/b9902c314aef4afb8f7a29bf8c5b37b3/1b567b05e53c4cb9b130026cb2e7302d.html) which in turn requires running `cds build` to generate all the deployable HDI artifacts. For example, run this in [cap/samples/bookshop](https://github.com/SAP-samples/cloud-cap-samples/tree/main/bookshop):

```sh
cds build --for hana
```

Which should display this log output:

```log
[cds] - done > wrote output to:
   gen/db/init.js
   gen/db/package.json
   gen/db/src/gen/.hdiconfig
   gen/db/src/gen/.hdinamespace
   gen/db/src/gen/AdminService.Authors.hdbview
   gen/db/src/gen/AdminService.Books.hdbview
   gen/db/src/gen/AdminService.Books_texts.hdbview
   gen/db/src/gen/AdminService.Currencies.hdbview
   gen/db/src/gen/AdminService.Currencies_texts.hdbview
   gen/db/src/gen/AdminService.Genres.hdbview
   gen/db/src/gen/AdminService.Genres_texts.hdbview
   gen/db/src/gen/CatalogService.Books.hdbview
   gen/db/src/gen/CatalogService.Books_texts.hdbview
   gen/db/src/gen/CatalogService.Currencies.hdbview
   gen/db/src/gen/CatalogService.Currencies_texts.hdbview
   gen/db/src/gen/CatalogService.Genres.hdbview
   gen/db/src/gen/CatalogService.Genres_texts.hdbview
   gen/db/src/gen/CatalogService.ListOfBooks.hdbview
   gen/db/src/gen/data/sap.capire.bookshop-Authors.csv
   gen/db/src/gen/data/sap.capire.bookshop-Authors.hdbtabledata
   gen/db/src/gen/data/sap.capire.bookshop-Books.csv
   gen/db/src/gen/data/sap.capire.bookshop-Books.hdbtabledata
   gen/db/src/gen/data/sap.capire.bookshop-Books.texts.csv
   gen/db/src/gen/data/sap.capire.bookshop-Books.texts.hdbtabledata
   gen/db/src/gen/data/sap.capire.bookshop-Genres.csv
   gen/db/src/gen/data/sap.capire.bookshop-Genres.hdbtabledata
   gen/db/src/gen/localized.AdminService.Authors.hdbview
   gen/db/src/gen/localized.AdminService.Books.hdbview
   gen/db/src/gen/localized.AdminService.Currencies.hdbview
   gen/db/src/gen/localized.AdminService.Genres.hdbview
   gen/db/src/gen/localized.CatalogService.Books.hdbview
   gen/db/src/gen/localized.CatalogService.Currencies.hdbview
   gen/db/src/gen/localized.CatalogService.Genres.hdbview
   gen/db/src/gen/localized.CatalogService.ListOfBooks.hdbview
   gen/db/src/gen/localized.sap.capire.bookshop.Authors.hdbview
   gen/db/src/gen/localized.sap.capire.bookshop.Books.hdbview
   gen/db/src/gen/localized.sap.capire.bookshop.Genres.hdbview
   gen/db/src/gen/localized.sap.common.Currencies.hdbview
   gen/db/src/gen/sap.capire.bookshop.Authors.hdbtable
   gen/db/src/gen/sap.capire.bookshop.Books.hdbtable
   gen/db/src/gen/sap.capire.bookshop.Books_author.hdbconstraint
   gen/db/src/gen/sap.capire.bookshop.Books_currency.hdbconstraint
   gen/db/src/gen/sap.capire.bookshop.Books_foo.hdbconstraint
   gen/db/src/gen/sap.capire.bookshop.Books_genre.hdbconstraint
   gen/db/src/gen/sap.capire.bookshop.Books_texts.hdbtable
   gen/db/src/gen/sap.capire.bookshop.Genres.hdbtable
   gen/db/src/gen/sap.capire.bookshop.Genres_parent.hdbconstraint
   gen/db/src/gen/sap.capire.bookshop.Genres_texts.hdbtable
   gen/db/src/gen/sap.common.Currencies.hdbtable
   gen/db/src/gen/sap.common.Currencies_texts.hdbtable

```



### Generated HDI Artifacts

As we see from the log output `cds build` generates these deployment artifacts as expected by HDI, based on CDS models and .csv files provided in your projects:

- `.hdbtable` files for entities
- `.hdbview` files for views / projections
- `.hdbconstraint` files for database constraints
- `.hdbtabledata` files for CSV content
- a few technical files required by HDI, such as `.hdinamespace` and `.hdiconfig`



### Custom HDI Artifacts

In addition to the generated HDI artifacts, you can add custom ones by adding according files to folder `db/src`. For example, let's add an index for Books titles...

1. Add a file `db/src/sap.capire.bookshop.Books.hdbindex` and fill it with this content:

   ::: code-group

   ```sql [db/src/sap.capire.bookshop.Books.hdbindex]
   INDEX sap_capire_bookshop_Books_title_index
   ON sap_capire_bookshop_Books (title)
   ```

   :::

2. Run cds build again → this time you should see this additional line in the log output:
   ```log
   [cds] - done > wrote output to:
      ...
      gen/db/src/sap.capire.bookshop.Books.hdbindex // [!code focus]
   ```





## Deploying to SAP HANA

There are two ways to include SAP HANA in your setup: Use SAP HANA in a [hybrid mode](#cds-deploy-hana), meaning running your services locally and connecting to your database in the cloud, or running your [whole application](deployment/) on SAP Business Technology Platform. This is possible either in trial accounts or in productive accounts.

To make the following configuration steps work, we assume that you've provisioned, set up, and started, for example, your SAP HANA Cloud instance in the [trial environment](https://cockpit.hanatrial.ondemand.com). If you need to prepare your SAP HANA first, see [How to Get an SAP HANA Cloud Instance for SAP Business Technology Platform, Cloud Foundry environment](../get-started/troubleshooting#get-hana) to learn about your options.

### Prepare for Production { #configure-hana .impl .node }

To prepare the project, execute:

```sh
cds add hana --for hybrid
```

This configures deployment for SAP HANA to use the _hdbtable_ and _hdbview_ formats. The configuration is added to a `[hybrid]` profile in your _package.json_.

::: tip The profile `hybrid` relates to [the hybrid testing](../advanced/hybrid-testing) scenario
If you want to prepare your project for production and use the profile `production`, read the [Deploy to Cloud Foundry](deployment/) guide.
:::

No further configuration is necessary for Node.js. For Java, see the [Use SAP HANA as the Database for a CAP Java Application](https://developers.sap.com/tutorials/cp-cap-java-hana-db.html#880cf07a-1788-4fda-b6dd-b5a6e5259625) tutorial for the rest of the configuration.



### Using `cds deploy` for Ad-Hoc Deployments { #cds-deploy-hana .impl .node }

`cds deploy` lets you deploy _just the database parts_ of the project to an SAP HANA instance. The server application (the Node.js or Java part) still runs locally and connects to the remote database instance, allowing for fast development roundtrips.

Make sure that you're [logged in to Cloud Foundry](deployment/to-cf#deploy) with the correct target, that is, org and space.
Then in the project root folder, just execute:

```sh
cds deploy --to hana --profile hybrid
```

> To connect to your SAP HANA Cloud instance use `cds watch --profile hybrid`.

Behind the scenes, `cds deploy` does the following:

* Compiles the CDS model to SAP HANA files (usually in _gen/db_, or _db/src/gen_)
* Generates _[.hdbtabledata](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c2cc2e43458d4abda6788049c58143dc/35c4dd829d2046f29fc741505302f74d.html)_ files for the [CSV files](databases#providing-initial-data) in the project. If a _[.hdbtabledata](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c2cc2e43458d4abda6788049c58143dc/35c4dd829d2046f29fc741505302f74d.html)_ file is already present next to the CSV files, no new file is generated.
* Creates a Cloud Foundry service of type `hdi-shared`, which creates an HDI container. Also, you can explicitly specify the name like so: `cds deploy --to hana:<myService>`.
* Starts `@sap/hdi-deploy` locally. If you need a tunnel to access the database, you can specify its address with `--tunnel-address <host:port>`.
* Stores the binding information in the _.cdsrc-private.json_ file of your project. With this information, `cds watch`/`run` can fetch the SAP HANA credentials at runtime, so that the server can connect to it.

[Learn more about the deployment using HDI.](https://help.sap.com/docs/HANA_CLOUD_DATABASE/b9902c314aef4afb8f7a29bf8c5b37b3/1b567b05e53c4cb9b130026cb2e7302d.html){.learn-more}
[Learn more about hybrid testing using service bindings to Cloud services.](../advanced/hybrid-testing#run-with-service-bindings){.learn-more}

If you run into issues, see the [Troubleshooting](../get-started/troubleshooting#hana) guide.

#### Deploy Parameters

When using `--to hana` to deploy your app to SAP HANA database you can specify the service name and logon information in several ways.

<br>

`cds deploy --to hana`

In this case the service name will either come from environment variable `VCAP_SERVICES` or will be defaulted from the project name, e.g. `myproject-db` with `myproject-db-key`. If they exist, they will be used otherwise created.

##### `cds deploy --to hana:myservice`

<i>DEPRECATED BEHAVIOUR</i><br>
This will overwrite any information coming from environment variables. The service name `myservice` will be used, the current Cloud Foundry client logon information be be taken to connect to the system.

<i>NEXT MAJOR BEHAVIOUR</i><br>
The service name will be merged with information coming from environment variables allowing you to use stored logon information to create the new servcie.

##### `cds deploy --vcap-file someEnvFile.json`

This will take logon information and service name from file `someEnvFile.json` and overwrite any environment variable already set.

##### `cds deploy --to hana:myservice --vcap-file someEnvFile.json`

<i>DEPRECATED BEHAVIOUR</i><br>
Using this command line allows you specify a service name, the logon information however comes from the local Cloud Foundry client.

<i>NEXT MAJOR BEHAVIOUR</i><br>
When specifying both `service name` and `vcap file` the information will be merged hence creating `myservice` in the system specified in `someEnvFile.json`.


### Using `cf deploy` or `cf push` { .impl .node }

See the [Deploying to Cloud Foundry](deployment/) guide for information about how to deploy the complete application to SAP Business Technology Platform, including a dedicated deployer application for the SAP HANA database.



## Native SAP HANA Features

The HANA Service provides dedicated support for native SAP HANA features as follows.

### Geospatial Functions

CDS supports the special syntax for SAP HANA geospatial functions:

```cds
entity Geo as select from Foo {
  geoColumn.ST_Area() as area : Decimal,
  new ST_Point(2.25, 3.41).ST_X() as x : Decimal
};
```

*Learn more in the [SAP HANA Spatial Reference](https://help.sap.com/docs/HANA_CLOUD_DATABASE/bc9e455fe75541b8a248b4c09b086cf5/7a2d11d7787c1014ac3a8663250814c2.html).*{.learn-more}



### Spatial Grid Generators

SAP HANA Spatial has some built-in [grid generator table functions](https://help.sap.com/docs/HANA_CLOUD_DATABASE/bc9e455fe75541b8a248b4c09b086cf5/2ead478dc6e14c429037efcdb5a75a6e.html). To use them in a CDS model, first
define corresponding facade entities in CDS.

Example for function `ST_SquareGrid`:

```cds
@cds.persistence.exists
entity ST_SquareGrid(size: Double, geometry: hana.ST_GEOMETRY) {
  geom: hana.ST_GEOMETRY;
  i: Integer;
  j: Integer;
}
```

Then the function can be called, parameters have to be passed by name:

```cds
entity V as select
  from ST_SquareGrid(size: 1.0, geometry: ST_GeomFromWkt('Point(1.5 -2.5)'))
{ geom, i, j };
```



### Functions Without Arguments

SAP HANA allows to omit the parentheses for functions that don't expect arguments. For example:

```cds
entity Foo { key ID : UUID; }
entity Bar as select from Foo {
  ID, current_timestamp
};
```

Some of which are well-known standard functions like `current_timestamp` in the previous example, which can be written without parentheses in CDS models. However, there are many unknown ones, that aren't known to the compiler, for example:

- `current_connection`
- `current_schema`
- `current_transaction_isolation_level`
- `current_utcdate`
- `current_utctime`
- `current_utctimestamp`
- `sysuuid`

To use these in CDS models, you have to add the parentheses so that CDS generic support for using native features can kick in:

```cds
entity Foo { key ID : UUID; }
entity Bar as select from Foo {
  ID, current_timestamp,
  sysuuid() as sysid // [!code focus]
};
```





### Regex Functions

CDS supports SAP HANA Regex functions (`locate_regexpr`, `occurrences_regexpr`, `replace_regexpr`, and `substring_regexpr`), and SAP HANA aggregate functions with an additional `order by` clause in the argument list. Example:

```sql
locate_regexpr(pattern in name from 5)
first_value(name order by price desc)
```

Restriction: `COLLATE` isn't supported.

For other functions, where the syntax isn't supported by the compiler (for example, `xmltable(...)`), a native _.hdbview_ can be used. See [Using Native SAP HANA Artifacts](../advanced/hana) for more details.







## HDI Schema Evolution

CAP supports database schema updates by detecting changes to the CDS model when executing the CDS build. If the underlying database offers built-in schema migration techniques, compatible changes can be applied to the database without any data loss or the need for additional migration logic. Incompatible changes like deletions are also detected, but require manual resolution, as they would lead to data loss.

| Change                             | Detected Automatically | Applied Automatically |
| ---------------------------------- | :--------------------: | :-------------------: |
| Adding  fields                     |        **Yes**         |        **Yes**        |
| Deleting fields                    |        **Yes**         |          No           |
| Renaming fields                    |    n/a <sup>1</sup>    |          No           |
| Changing datatype of fields        |        **Yes**         |          No           |
| Changing type parameters           |        **Yes**         |        **Yes**        |
| Changing associations/compositions |        **Yes**         |    No <sup>2</sup>    |
| Renaming associations/compositions |    n/a <sup>1</sup>    |          No           |
| Renaming entities                  |          n/a           |          No           |

> <sup>1</sup> Rename field or association operations aren't detected as such. Instead, corresponding ADD and DROP statements are rendered requiring manual resolution activities.
>
> <sup>2</sup> Changing targets may lead to renamed foreign keys. Possibly hard to detect data integrity issues due to non-matching foreign key values if target key names remain the same (for example "ID").

::: warning No support for incompatible schema changes
Currently there's no framework support for incompatible schema changes that require scripted data migration steps (like changing field constraints NULL > NOT NULL). However, the CDS build does detect those changes and renders them as non-executable statements, requesting the user to take manual resolution steps. We recommend avoiding those changes in productive environments.
:::

### Schema Evolution and Multitenancy/Extensibility

There's full support for schema evolution when the _cds-mtxs_ library is used for multitenancy handling. It ensures that all schema changes during base-model upgrades are rolled out to the tenant databases.

::: warning
Tenant-specific extensibility using the _cds-mtxs_ library isn't supported yet
Right now, you can't activate extensions on entities annotated with `@cds.persistence.journal`.
:::

### Schema Updates with SAP HANA {#schema-updates-with-sap-hana}

All schema updates in SAP HANA are applied using SAP HANA Deployment Infrastructure (HDI) design-time artifacts, which are auto-generated during CDS build execution.

Schema updates using _.hdbtable_ deployments are a challenge for tables with large data volume. Schema changes with _.hdbtable_ are applied using temporary table generation to preserve the data. As this could lead to long deployment times, the support for _.hdbmigrationtable_ artifact generation has been added. The [Migration Table artifact type](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c2cc2e43458d4abda6788049c58143dc/52d1f5acfa754a7887e21226641eb261.html) uses explicit versioning and migration tasks. Modifications of the database table are explicitly specified in the design-time file and carried out on the database table exactly as specified. This saves the cost of an internal table-copy operation. When a new version of an already existing table is deployed, HDI performs the migration steps that haven't been applied.

#### Deploy Artifact Transitions as Supported by HDI {#deploy-artifact-transitions}

| Current format    | hdbcds | hdbtable | hdbmigrationtable |
|-------------------|:------:|:--------:|:-----------------:|
| hdbcds            |        |  yes  |      n/a      |
| hdbtable          | n/a |          |       yes       |
| hdbmigrationtable | n/a |  Yes  |                   |

::: warning
Direct migration from _.hdbcds_ to _.hdbmigrationtable_ isn't supported by HDI. A deployment using _.hdbtable_ is required up front.

[Learn more in the **Enhance Project Configuration for SAP HANA Cloud** section.](#configure-hana){.learn-more}

During the transition from _.hdbtable_ to _.hdbmigrationtable_ you have to deploy version=1 of the _.hdbmigrationtable_ artifact, which must not include any migration steps.
:::

HDI supports the _hdbcds → hdbtable → hdbmigrationtable_ migration flow without data loss. Even going back from _.hdbmigrationtable_ to _.hdbtable_ is possible. Keep in mind that you lose the migration history in this case.
For all transitions you want to execute in HDI, you need to specify an undeploy allowlist as described in [HDI Delta Deployment and Undeploy Allow List](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c2b99f19e9264c4d9ae9221b22f6f589/ebb0a1d1d41e4ab0a06ea951717e7d3d.html) in the SAP HANA documentation.

#### Enabling hdbmigrationtable Generation for Selected Entities During CDS Build {#enabling-hdbmigrationtable-generation}

If you're migrating your already deployed scenario to _.hdbmigrationtable_ deployment, you've to consider the remarks in [Deploy Artifact Transitions as Supported by HDI](#deploy-artifact-transitions).

By default, all entities are still compiled to _.hdbtable_ and you only selectively choose the entities for which you want to build _.hdbmigrationtable_ by annotating them with `@cds.persistence.journal`.

Example:

```cds
namespace data.model;

  @cds.persistence.journal
  entity LargeBook {
    key id : Integer;
    title : String(100);
    content : LargeString;
  }
```

CDS build generates _.hdbmigrationtable_ source files for annotated entities as well as a _last-dev/csn.json_ source file representing the CDS model state of the last build.

> These source files have to be checked into the version control system.

Subsequent model changes are applied automatically as respective migration versions including the required schema update statements to accomplish the new target state.
There are cases where you have to resolve or refactor the generated statements, like for reducing field lengths. As they can't be executed without data loss (for example, `String(100)` -> `String(50)`), the required migration steps are only added as comments for you to process explicitly.

Example:

```txt
>>>> Manual resolution required - DROP statements causing data loss are disabled
>>>> by default.
>>>> You may either:
>>>>   uncomment statements to allow incompatible changes, or
>>>>   refactor statements, e.g. replace DROP/ADD by single RENAME statement
>>>> After manual resolution delete all lines starting with >>>>>
-- ALTER TABLE my_bookshop_Books DROP (title);
-- ALTER TABLE my_bookshop_Books ADD (title NVARCHAR(50));
```

Changing the type of a field causes CDS build to create a corresponding ALTER TABLE statement. [Data type conversion rules](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c1d3f60099654ecfb3fe36ac93c121bb/46ff9650c7f44461a6146269c1e2a4c6.html) are applied by the SAP HANA database as part of the deployment step. This may cause the deployment to fail if the column contents can't be converted to the new format.

Examples:

1. Changing the type of a field from String to Integer may cause tenant updates to fail if existing content can't be converted.
2. Changing the type of a field from Decimal to Integer can succeed, but decimal places are truncated. Conversion fails if the content exceeds the maximum Integer length.

We recommend keeping _.hdbtable_ deployment for entities where you expect low data volume. Every _.hdbmigrationtable_ artifact becomes part of your versioned source code, creating a new migration version on every model change/build cycle. In turn, each such migration can require manual resolution.
You can switch large-volume tables to _.hdbmigrationtable_ at any time, keeping in mind that the existing _.hdbtable_ design-time artifact needs to be undeployed.
::: tip
Sticking to _.hdbtable_ for the actual application development phase avoids lots of initial migration versions that would need to be applied to the database schema.
:::

CDS build performs rudimentary checks on generated _.hdmigrationtable_ files:

- CDS build fails if inconsistencies are encountered between the generated _.hdbmigrationtable_ files and the _last-dev/csn.json_ model state. For example, the last migration version not matching the table version is such an inconsistency.
- CDS build fails if manual resolution comments starting with `>>>>>` exist in one of the generated _.hdbmigrationtable_ files. This ensures that manual resolution is performed before deployment.

### Native Database Clauses {#schema-evolution-native-db-clauses}
Not all clauses supported by SQL can directly be written in CDL syntax. To use native database clauses also in a CAP CDS model, you can provide arbitrary SQL snippets with the annotations [`@sql.prepend` and `@sql.append`](databases#sql-prepend-append). In this section, we're focusing on schema evolution specific details.

Schema evolution requires that any changes are applied by corresponding ALTER statements. See [ALTER TABLE statement reference](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c1d3f60099654ecfb3fe36ac93c121bb/20d329a6751910149d5fdbc4800f92ff.html) for more information. A new migration version is generated whenever an `@sql.append` or `@sql.prepend` annotation is added, changed, or removed. ALTER statements define the individual changes that create the final database schema. This schema has to match the schema defined by the TABLE statement in the _.hdbmigrationtable_ artifact.
Please note that the compiler doesn't evaluate or process these SQL snippets. Any snippet is taken as is and inserted into the TABLE statement and the corresponding ALTER statement. The deployment fails in case of syntax errors.

CDS Model:
```cds
@cds.persistence.journal
@sql.append: 'PERSISTENT MEMORY ON'
entity E {
  ...,
  @sql.append: 'FUZZY SEARCH INDEX ON'
  text: String(100);
}
```

Result in hdbmigrationtable file:
```sql
== version=2
COLUMN TABLE E (
  ...,
  text NVARCHAR(100) FUZZY SEARCH INDEX ON
) PERSISTENT MEMORY ON

== migration=2
ALTER TABLE E PERSISTENT MEMORY ON;
ALTER TABLE E ALTER (text NVARCHAR(100) FUZZY SEARCH INDEX ON);
```

It's important to understand that during deployment new migration versions will be applied on the existing database schema. If the resulting schema doesn't match the schema as defined by the TABLE statement, deployment fails and any changes are rolled-back. In consequence, when removing or replacing an existing `@sql.append` annotation, the original ALTER statements need to be undone. As the required statements can't automatically be determined, manual resolution is required. The CDS build generates comments starting with `>>>>` in order to provide some guidance and enforce manual resolution.

Generated file with comments:
```txt
== migration=3
>>>>> Manual resolution required - insert ALTER statement(s) as described below.
>>>>> After manual resolution delete all lines starting with >>>>>
>>>>> Insert ALTER statement for: annotation @sql.append of artifact E has been removed (previous value: "PERSISTENT MEMORY ON")
>>>>> Insert ALTER statement for: annotation @sql.append of element E:text has been removed (previous value: "FUZZY SEARCH INDEX ON")
```

Manually resolved file:
```sql
== migration=3
ALTER TABLE E PERSISTENT MEMORY DEFAULT;
ALTER TABLE E ALTER (text NVARCHAR(100) FUZZY SEARCH INDEX OFF);
```
Appending text to an existing annotation is possible without manual resolution. A valid ALTER statement will be generated in this case. For example, appending the `NOT NULL` column constraint to an existing `FUZZY SEARCH INDEX ON` annotation generates the following statement:
```sql
ALTER TABLE E ALTER (text NVARCHAR(100) FUZZY SEARCH INDEX ON NOT NULL);
```

::: warning
You can use `@sql.append` to partition your table initially, but you can't subsequently change the partitions using schema evolution techniques as altering partitions isn't supported yet.
:::

### Advanced Options

The following CDS configuration options are supported to manage _.hdbmigrationtable_ generation.
<!-- REVISIT: This warning has been in here for 2+ years -->
::: warning
This hasn't been finalized yet.
:::

```js
{
  "hana" : {
    "journal": {
      "enable-drop": false,
      "change-mode": "alter" // "drop"
    },
    // ...
  }
}
```

The `"enable-drop"` option determines whether incompatible model changes are rendered as is (`true`) or manual resolution is required (`false`). The default value is `false`.

The `change-mode` option determines whether `ALTER TABLE ... ALTER` (`"alter"`) or `ALTER TABLE ... DROP` (`"drop"`) statements are rendered for data type related changes. To ensure that any kind of model change can be successfully deployed to the database, you can switch the `"change-mode"` to `"drop"`, keeping in mind that any existing data will be deleted for the corresponding column. See [hdbmigrationtable Generation](#enabling-hdbmigrationtable-generation) for more details. The default value is `"alter"`.



## Caveats



### CSV Data Gets Overridden

HDI deploys CSV data as _.hdbtabledata_, which assumes exclusive ownership of the data. It's overridden with the next application deployment; hence:

::: tip

Only use CSV files for _configuration data_ that can't be changed by application users.

:::

Yet, if you need to support initial data with user changes, you can use the `include_filter` option that _[.hdbtabledata](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c2cc2e43458d4abda6788049c58143dc/35c4dd829d2046f29fc741505302f74d.html)_ offers.



### Undeploying Artifacts

As documented in the [HDI Deployer docs](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c2b99f19e9264c4d9ae9221b22f6f589/ebb0a1d1d41e4ab0a06ea951717e7d3d.html), an HDI deployment by default never deletes artifacts. So, if you remove an entity or CSV files, the respective tables, and content remain in the database.

By default, `cds add hana` creates an `undeploy.json` like this:

::: code-group

```json [db/undeploy.json]
[
  "src/gen/**/*.hdbview",
  "src/gen/**/*.hdbindex",
  "src/gen/**/*.hdbconstraint",
  "src/gen/**/*_drafts.hdbtable"
]
```

:::

If you need to remove deployed CSV files, also add this entry:

::: code-group

```json [db/undeploy.json]
[
  ...
  "src/gen/**/*.hdbtabledata"
]
```

:::

*See this [troubleshooting](../get-started/troubleshooting#hana-csv) entry for more information.*{.learn-more}
