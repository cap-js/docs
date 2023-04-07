---
index: 31
label: Databases
synopsis: >
  This guide will help you to learn about defining, providing, implementing, deploying, and publishing services --- so it's about _Service Providers_ in general.
layout: cookbook
status: released
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/e4a7559baf9f4e4394302442745edcd9.html
---
<!--- Migrated: @external/guides/31-Databases/index.md -> @external/guides/databases/index.md -->

# Using Databases

{{ $frontmatter.synopsis }}
<!--- {% include links.md %} -->

## Reading and Writing Data {: .impl.beta}

Use `cds.ql` to read and write data based on CDS models. Its features include:

* Fluent, embedded cql-like language binding, and APIs
* Statements based on cds models
* Parallel and serialized execution
* Automatic parameter binding
* Nested transactions
* Connection pooling
* Driver plugin architecture
* Canonical representation for queries (&rarr; [CQN](../../cds/cqn))
* Support for SQL as well as NoSQL databases (experimental)

> All the examples in this guide can be executed without further development. For example, run `cds` from your cmd line and just copy and paste the snippets from here to the [REPL](../../get-started/in-a-nutshell#repl).

## Providing Initial Data {: #providing-initial-data}

CSV files in your project are picked up by deployments for both SQLite and SAP HANA. If you've accidentally deployed such data to a productive database, see this [troubleshooting](../../advanced/troubleshooting#hana-csv) entry on how to recover from this situation.

The locations of CSV files are determined based on the location of CDS model files. CSV files can be defined in any _csv_ or _data_ subfolder, including _db/data_ and _db/csv_. Initial data is only fetched, if the corresponding entity is contained in your compiled model. This also includes CSV files of *reuse modules*. `cds build` will copy these files into the application's deployment folder.

The following conventions apply:
* CSV file location:
  * _csv_ or _data_ subfolder related to a CDS model file, including _db/csv_ and _db/data_ folders
  * _db/src/**_ folder for CSV files and corresponding _hdbtabledata_ files. These files will be treated as native SAP HANA artifacts and deployed as they are.
* Each file contains data for one entity.
* File names must follow the pattern _namespace-entity.csv_. <br>
  Pattern for nested entities: _namespace-entity.nestedEntity.csv_. <br>
  Examples: _my.bookshop-Books.csv_, or _my.bookshop-Books.ISBN.csv_.
* They must start with a header line that lists the needed element names.

::: danger
On SAP HANA, only use CSV files for _configuration data_ that can’t be changed by application users. CSV files are deployed as _[.hdbtabledata](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c2cc2e43458d4abda6788049c58143dc/35c4dd829d2046f29fc741505302f74d.html)_ which assumes exclusive ownership of the data. It’s overwritten with the next application deployment. To avoid such a situation, you can use the `include_filter` option that _[.hdbtabledata](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c2cc2e43458d4abda6788049c58143dc/35c4dd829d2046f29fc741505302f74d.html)_ offers.
:::

#### CSV Import of Array-Typed Elements

Values for elements with arrayed types can be specified in CSV files as well. The values need to be presented as JSON arrays as shown in the following example:

```cds
entity Samples : cuid {
    records : array of {
        index: Integer;
        flag: Boolean
    }
}
```

A CSV file `Samples.csv` in folder `db/data` containing a single entity instance to be imported could look like this:

```csv
ID;records
...;[{"index": 1, "flag": true}, {"index": 2, "flag": false}]
```

## Deployment

Get an overview of your deployment options.

<!--
<img src="assets/using_databases.png" width="300px">
-->

### SQLite {: #deploy-to-sqlite}


The fastest way to let your application run is using a local SQLite database via the [sqlite3](https://www.npmjs.com/package/sqlite3) npm module, which is a devDependency of your project. Using the `cds deploy --to sqlite` command line helps you deploy the database parts of the project to a local SQLite database. It does the following:


* Creates an SQLite database file in your project.
* Drops existing tables and views, and re-creates them according to the CDS model.
* Deploys [CSV files](#providing-initial-data) with initial data.

[See it in action](../../get-started/in-a-nutshell#databases){: .learn-more}

### SAP HANA {: #get-hana}

When you're moving from the development phase to the production phase, use SAP HANA Cloud as your database. There are 2 ways to include SAP HANA in your setup: Use SAP HANA in a [hybrid mode](#cds-deploy-hana), meaning running your services locally and connecting to your database in the cloud, or running your [whole application](../../guides/deployment/) on SAP Business Technology Platform. This is possible either in trial accounts or in productive accounts. To make the following configuration steps work, we assume that you've provisioned, set up, and started, for example, your SAP HANA Cloud instance in the [trial environment](https://cockpit.hanatrial.ondemand.com).
If you need to prepare your SAP HANA first, see [How to Get an SAP HANA Cloud Instance for SAP Business Technology Platform, Cloud Foundry environment](../../advanced/troubleshooting#get-hana) to learn about your options.

#### Enhance Project Configuration for SAP HANA Cloud {: #configure-hana}

To prepare the project, execute:

```sh
cds add hana --for hybrid
```

> This configures deployment for SAP HANA to use the _hdbtable_ and _hdbview_ formats.  The default format of _hdbcds_ isn't available on SAP HANA Cloud. The configuration is added to a `[hybrid]` profile in your _package.json_.
::: tip
The profile `hybrid` relates to [the hybrid testing](../../advanced/hybrid-testing) scenario. If you want to prepare your project for production and use the profile `production`, read the [Deploy to Cloud Foundry](../deployment/) guide.
:::

##### For Node.js

No further configuration is necessary.
For your information, this is what the previous command changed in _package.json_:

* The [`hdb`](https://www.npmjs.com/package/hdb) driver for SAP HANA is added as a dependency.
* A datasource of type `hana-cloud` is added in the `cds.requires.[production].db` block. See [Node.js configuration](../../node.js/cds-env#profiles) for more details.

##### For Java

See the [Use SAP HANA as the Database for a CAP Java Application](https://developers.sap.com/tutorials/cp-cap-java-hana-db.html#880cf07a-1788-4fda-b6dd-b5a6e5259625) tutorial for the rest of the configuration.

#### Deploy using `cds deploy` {: #cds-deploy-hana}

`cds deploy` lets you deploy _just the database parts_ of the project to an SAP HANA instance.  The server application (the Node.js or Java part) still runs locally and connects to the remote database instance, allowing for fast development roundtrips.

Make sure that you're [logged in to Cloud Foundry](../../guides/deployment/to-cf#deploy).
Then in the project root folder, just execute:

```sh
cds deploy --to hana --profile hybrid
```
> To connect to your SAP HANA Cloud instance use `cds watch --profile hybrid`.

Behind the scenes, `cds deploy` does the following:

* Compiles the CDS model to SAP HANA files (usually in _gen/db_, or _db/gen_)
* Generates _[.hdbtabledata](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c2cc2e43458d4abda6788049c58143dc/35c4dd829d2046f29fc741505302f74d.html)_ files for the [CSV files](#providing-initial-data) in the project. If an _[.hdbtabledata](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c2cc2e43458d4abda6788049c58143dc/35c4dd829d2046f29fc741505302f74d.html)_ file is already present next to the CSV files, no new file is generated.
* Creates a Cloud Foundry service of type `hdi-shared`, which creates an HDI container. Also, you can explicitly specify the name like so: `cds deploy --to hana:<myService>`.
* Starts `@sap/hdi-deploy` locally. Should you need a tunnel to access the database, you can specify its address with `--tunnel-address <host:port>`.
* Stores the binding information in the _.cdsrc-private.json_ file of your project. With this information, `cds watch`/`run` can fetch the SAP HANA credentials at runtime, so that the server can connect to it.

[Learn more about the deployment using HDI](https://help.sap.com/docs/HANA_CLOUD_DATABASE/b9902c314aef4afb8f7a29bf8c5b37b3/1b567b05e53c4cb9b130026cb2e7302d.html){:.learn-more}
[Learn more about hybrid testing using service bindings to Cloud services.](../../advanced/hybrid-testing#run-with-service-bindings){:.learn-more}

If you run into issues, see the [Troubleshooting](../../advanced/troubleshooting#hana) guide.

#### Deploy Using `cf deploy` or `cf push`

See the [Deploying to Cloud Foundry](../../guides/deployment/) guide for information about how to deploy the complete application to SAP BTP.

## Mapping CDS to SQL


By default, when deploying data models to SQL databases, all entities become SQL tables and all views become SQL views.

### Influencing Persistence Mapping

#### Using Already Existing Entities {:.impl.beta}
* Use `@cds.persistence.exists` to indicate that an object shouldn’t be created in the database,
  because the database object already exists. The names of the existing object and its columns must exactly
  match the names that would have been generated based on the entity definition.
  One of the common scenarios where this annotation comes in handy is [Using Native SAP HANA Artifacts](../../advanced/hana)
  in a CAP application.

* If the entity in the model annotated with `@cds.persistence.exists` represents a user-defined function or a
  calculation view, one of the annotations `@cds.persistence.udf` or `@cds.persistence.calcview` also needs to be assigned. See [Calculated Views and User-Defined Functions](../../advanced/hana#calculated-views-and-user-defined-functions) for more details.

#### Skipping Entities {:.impl.beta}
* Use `@cds.persistence.skip` to indicate that an object shouldn’t be created in the database,
  because it’s implemented in the service layer.

#### Views as Tables {:.impl.beta}
* Use `@cds.persistence.table` to create a table with the effective signature of a view definition instead of an SQL view.
  All parts of the view definition not relevant for the signature (like `where`, `group by`, ...) are ignored.
  A common use case for this annotation is in conjunction with the `@cds.persistence.skip` annotation. The  `@cds.persistence.skip` annotation is applied automatically
  on all entities imported from third-party services. For example, when an EDMX file from an S/4 system is imported in your
  CAP application, all the entities get the `@cds.persistence.skip` annotation. In order to have the remote entity as a local entity
  in your CAP application and, for example, to cache some data, you would declare a view on
  the imported entity and annotate it with `@cds.persistence: { skip: false, table }`.

#### Inserting SQL Snippets

* Use `@sql.prepend` and `@sql.append` to insert SQL snippets into the SQL statements generated by the compiler.
See [Native Database Clauses](../../guides/databases/#native-db-clauses) for more details.

### Qualified Names &rarr; Underscored Names

The dots in qualified names of CDS definitions are mapped to underscores in plain SQL.
For example:

```cds
namespace foo.bar;
context Car {
  entity Wheel { diameter: Decimal; }
}
```

unfolds to the following SQL DDL statement:

```sql
CREATE TABLE foo_bar_Car_Wheel (
  diameter Decimal
)
```

### Structured Elements &rarr; Flattened Columns {:.impl.beta}
Structured elements in an entity definition are equivalent to a flattened definition of individual columns. For example, the following definition:

```cds
entity Authors { name: String;
  address { street: String;
    town { name: String; }
  }
}
```

unfolds to the following DDL statement:

```sql
CREATE TABLE Authors (
  name NVARCHAR(5000),
  address_street NVARCHAR(5000),
  address_town_name NVARCHAR(5000)
)
```

Correspondingly, the following CQL queries using [_Path Expressions_](../../cds/cql#path-expressions) along structs:

```sql
SELECT name, address.street from Authors;
SELECT name, address.town.name from Authors;
SELECT name, address.* from Authors;
```

map to these plain SQL `SELECT` statements:

```sql
SELECT name, address_street from Authors;
SELECT name, address_town_name from Authors;
SELECT name, address_street, address_town_name from Authors;
```

> See [_Postfix Projections_](../../cds/cql#postfix-projections) for additional means to query struct elements.

### Associations &rarr; Forward-Declared JOINs {:#associations.impl.beta}

Associations introduce forward-declared Joins. Their names act like corresponding table aliases in queries. In addition, managed associations automatically add foreign keys. For example:

```cds
entity Books {
  title : String;
  author : Association to Authors;
}
entity Authors {
  key ID : UUID;
  name : String;
  address : Association to Addresses;
  books : Association to many Books;
}
entity Addresses {
  key ID : UUID;
  town : Association to Towns;
}
entity Towns {
  key ID : UUID;
  name : String;
}
```

unfolds to the following SQL DDL statements with native support for associations (as referenced in the SAP HANA SQL Reference Guide with the release of SAP HANA Platform 2.0 SPS 00):

```sql
CREATE TABLE Books (
  title varchar(111),
  author_ID varchar(36)  -- foreign key for managed assoc
) WITH ASSOCIATIONS (
  JOIN Authors as author ON author.ID = author_ID  -- to-one
);

CREATE TABLE Authors (
  ID varchar(36),
  name varchar(111),
  address_ID varchar(36)  -- foreign key for managed assoc
) WITH ASSOCIATIONS (
  JOIN Addresses as address ON address.ID = address_ID,
  JOIN Books as books ON books.author_ID = ID      -- to-many
);

CREATE TABLE Addresses (
  ID varchar(36),
  town_ID varchar(36)  -- foreign key for managed assoc
) WITH ASSOCIATIONS (
  JOIN Towns as town ON town.ID = town_ID
);

CREATE TABLE Towns (
  ID varchar(36),
  name varchar(111)
);
```

## Feature Comparison {: .impl.beta}

SAP HANA is the primary database of choice for productive use and supports the richer feature set. However, we aim for a close to equally rich feature set on other databases to support lightweight local development. The following sections detail known gaps and limitations.

### Path Expressions

Path expressions including infix filters can be used as described in the [CQL](../../cds/cql#path-expressions) documentation.

The CAP Java SDK supports [path expressions](../../java/query-api#path-expressions) on HANA, H2, SQLite and PostgreSQL.

HANA supports path expressions natively. On other DBs, additional joins are needed, which the Node.js runtime does not yet generate. Hence, path expressions are only supported on HANA. Exception: key properties of association to one, such that base entity has property as foreign key. then, *path-expression-like* constructs can be used on sqlite as well, for example, `GET /Books?$orderby=author/ID` works because Books has `author_ID`


path expressions are used in:
- ql where/ order by/ etc. -> as documented in [CQL guide](../../cds/cql)
- odata/ "sap-style rest" query options like $filter, et al.

#### HANA

- **Java** + **Node.js**: full support

#### SQLite


### Where Exists Predicates

The CAP Java SDK supports [where exists](../../java/query-api#exists-subquery) subqueries as well as [any/allMatch](../../java/query-api#any-match) predicates on HANA, H2, SQLite and PostgreSQL.

- Java supports path expressions including infix filters as documented in TODO also for SQLite
  + Note: no paths within infix filters (PR #2969) -> same limitation in compiler
- Node.js allows one-level path expressions referring to target primary keys of managed associations -> are handled like structs
  + example: `GET /Books?$orderby=author/ID`

-> intro with link to CQL doc section
-> to be checked: same and all supported wrt HANA, SQLite, Java, Node.js
-> the restrictions, if any, re Path Expressions apply

### Locale

The CAP Java SDK supports [localized elements](../../guides/localized-data/) on HANA, H2, SQLite and PostgreSQL.

If all views expose the [localized](../../guides/localized-data/#resolving-localized-texts-at-runtime) association, there are no restrictions on H2, SQLite and PostgreSQL. In case localized is not exposed, a system property `supported_locales` with the supported language codes has to be set:

```java
	System.setProperty("supported_locales","en,fr,es,it");
```

[locale](../localized-data/#propagating-of-user-locale)

- **Java** + **Node.js** for **HANA**: full support
- **Java** for **SQLite**:
  + if localized assoc is available (i.e. propagated in view) CAP Java SDK sets locales dynamically (by-passing SQL views generated by compiler)
  + fallback: as in case of Node.js described below:
- **Node.js** for **SQLite**: only for static set of locales (de,en,fr) -> requires statically created SQL views à la localized_..._de
  + on sqlite, an additional view is needed for each locale (`en` texts get written to the original table) -> extra config needed but no limitation
  + cf. [localized views](../localized-data/#resolving-localized-texts-via-views)


### Session variables

The CAP Java SDK has full support for session variables such as `$user.id`, `$user.locale` and `$now` on HANA. On H2, SQLite and PostgreSQL, session variables are not supported in views but only in `where` clauses of [CQL](../../cds/cql) queries and `on` conditions of associations.

- **Node.js** for **HANA**: full support
- **Node.js** for **SQLite**: single static user configurable via compiler's magic vars


### Temporal Data

On databases other than HANA, only [as-of-now-queries](../../guides/temporal-data/#as-of-now-queries) are supported.

- **Node.js**: temporal data impl requires session contexts, which are not available on sqlite. in the future, the runtimes will most likely use special where clauses, which would make temporal data available on any db. currently, SQLite is always "as of now".

### Multiuser

The CAP Java SDK supports connection pooling and pessimistic locking via [select for update](../../java/query-execution#pessimistic-locking)
for HANA, H2 and PostgreSQL.

Although connection pooling can be configured for SQLite, we recommend to set the `maximum-pool-size` to 1, due to the limited concurrency support in SQLite.


- **Node.js** for **HANA**: full support
- **Node.js** for **SQLite**: no support
  + sqlite feature that would allow concurrency: https://www.sqlite.org/cgi/src/doc/begin-concurrent/doc/begin_concurrent.md -> once that is delivered, we can implement
  + [select for update](../../guides/providing-services/#select-for-update) simply executes a select


### Multitenancy

The CAP Java SDK supports testing multitenant scenarios with PostgreSQL and H2. // with Aug release -> MT lib Frank


### Functions

The CAP Java SDK supports [scalar](../../java/query-api#scalar-functions) and [predicate](../../java/query-api#predicate-functions) functions on HANA, H2, SQLite and PostgreSQL.

__TODO: check which odata funcs to take over in cqn__

__TODO: Java?__


- **Node.js** for **HANA**: `ceiling`, `floor`, `round`
- **Node.js** for **SQLite**: `round` only

### locale-dependent sorting

- for **HANA**: via `WITH PARAMETERS ('LOCALE' = '<locale>')`
- for **SQLite**: via `COLLATE NOCASE` - As [SQLite collation](https://www.sqlite.org/datatype3.html#collation) doesn't support locale-specific sorting, case insensitive sorting is applied.


### Views with parameters

Views with parameters are supported on HANA only.



### HANA-only features in Node.js

- Multitenancy
- views with parameters
- fuzzy search
- stored procedures
- data type binary as key property

### SQLite-only features in Node.js

- db-generated keys
- boolean operators (cf. [generic-filter.test.js](https://github.tools.sap/cap/cds/blob/ff7cd1b26a902a81cbd84ebcf8f250d8ef647372/tests/_runtime/odata/__tests__/integration/generic-filter.test.js#L303))

## Native Features

### Using SQLite and SAP HANA Functions {: #sqlite-and-hana-functions}

CAP samples demonstrate how you can use [native database functions of SQLite and SAP HANA](https://github.com/SAP-samples/cloud-cap-samples/commit/65c8c82f745e0097fab6ca8164a2ede8400da803) in one code base. There is also a [code tour](https://github.com/SAP-samples/cloud-cap-samples#code-tours) available for it.

### Functions {: #native-db-functions}

You can use native database functions inside your CDS model.
CDS generically supports all functions that have the standard call syntax of `function(param1, param2)`.

Example:
```cds
entity Books {
  key id: Integer;
  name: String;
  description: String;
  author: String;
  price: Decimal;
};

entity BookPreview as select from Books {
  id,
  // HANA function IFNULL
  IFNULL(description, name) as shorttext: String,
  author
};
```

The `OVER` clause for SQL Window Functions is supported, too:
```cds
entity Ranking as select from Books {
  name, author,
  rank() over (partition by author order by price) as rank
};
```
> Restriction: `COLLATE` is not supported.

CDS also supports the instance method call syntax and instantiation syntax
for geospatial functions.

Example:
```cds
entity Geo as select from Foo {
  geoColumn.ST_Area() as area : Decimal,
  new ST_Point(2.25, 3.41).ST_X() as x : Decimal
};
```
See [SAP HANA Spatial Reference](https://help.sap.com/docs/HANA_CLOUD_DATABASE/bc9e455fe75541b8a248b4c09b086cf5/7a2d11d7787c1014ac3a8663250814c2.html) for more
information on the geospatial functions supported by SAP HANA.

Using native functions means that deployment to other databases where these functions don't exist **fails**. These errors only come up during deployment time, not compile time. To use native SAP HANA function but still use SQLite for development, some configuration is needed. See the section [Using SQLite and SAP HANA Functions](#sqlite-and-hana-functions)

The SQL standard defines some functions that are called without parentheses: `current_date`, `current_time`, `current_timestamp`, `current_user`, `session_user`, `system_user`. They can be used in CDS without parentheses, too.

#### SAP HANA functions with non-standard syntax

SAP HANA defines some more functions that are called without parentheses (`current_connection`, `current_schema`, `current_transaction_isolation_level`, `current_utcdate`, `current_utctime`, `current_utctimestamp`, `sysuuid`). In CDS, you have to call them with the standard syntax *with* parentheses, like `current_connection()`.

CDS supports SAP HANA Regex functions (`locate_regexpr`, `occurrences_regexpr`, `replace_regexpr`, and `substring_regexpr`),
and SAP HANA aggregate functions with an additional `order by` clause in the argument list. Example:
```sql
locate_regexpr(pattern in name from 5)
first_value(name order by price desc)
```
Restriction: `COLLATE` is not supported.

For other functions, where the syntax isn't supported by the compiler (for example, `xmltable(...)`), a native _.hdbview_ can be used. See [Using Native SAP HANA Artifacts](../../advanced/hana) for more details.


#### SAP HANA Spatial grid generator functions

SAP HANA Spatial has some built-in [grid generator table functions](https://help.sap.com/docs/HANA_CLOUD_DATABASE/bc9e455fe75541b8a248b4c09b086cf5/2ead478dc6e14c429037efcdb5a75a6e.html). To use them in a CDS model, first
define corresponding facade entities in CDS.

Example for function ST_SquareGrid:
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


### Native Database Clauses {: #native-db-clauses}

CDS generates `CREATE TABLE` or `CREATE VIEW` statements for entity definitions.
Not all clauses supported by SQL in `CREATE TABLE` or `CREATE VIEW` can directly be
written in CDS syntax. In particular not those clauses that are specific to a certain database. For using such native database clauses also in a CAP CDS model, you can provide
arbitrary SQL snippets with the annotations `@sql.prepend` and `@sql.append`.

For HDBCDS and HDBTABLE/HDBVIEW, the compiler does not check the SQL snippets in any way. For "normal" SQL, the characters `;`, `--`, `/*`and `*/` are forbidden. The compiler does not evaluate or process these SQL snippets, but simply inserts them into the generated `CREATE` statements:

* The value of `@sql.append` provided for **an entity** is added at the end of the statement generated by the compiler.
* The value of `@sql.append` provided for **an element of an entity** is added at the end of the respective column definition,
if a database table is generated for the entity. The annotation may not be used for elements of an entity that turns into a view.
* Annotation `@sql.prepend` is only supported for entities that are translated to a table. The annotation must not be provided on element level.
  The annotation value is inserted immediately before the keyword `TABLE`.
  When generating HDBTABLE, there is an implicit `@sql.prepend: 'COLUMN'` that is overwritten by an explicitly provided `@sql.prepend`.

Model:
```cds
@sql.append: ```sql
             GROUP TYPE foo
             GROUP SUBTYPE bar
             ```
entity E {
  ...,
  @sql.append: 'FUZZY SEARCH INDEX ON'
  text: String(100);
}

@sql.append: 'WITH DDL ONLY'
entity V as select from E { ... };
```

Result:
```sql
CREATE TABLE E (
  ...,
  text NVARCHAR(100) FUZZY SEARCH INDEX ON
) GROUP TYPE foo
GROUP SUBTYPE bar;

CREATE VIEW V AS SELECT ... FROM E WITH DDL ONLY;
```

* If you refer to a column name in the annotation, you need to take care of
a potential name mapping yourself, for example, for structured elements.
* If you want to provide clauses for different databases, use separate annotation files with
respective `annotate` statements and control them via build configurations, like explained previously for
[Using SQLite and SAP HANA Functions](../../guides/databases/#sqlite-and-hana-functions).
* The annotations `@sql.prepend` and `@sql.append` are not allowed in a SaaS extension project.

If you use native database clauses in entities where schema evolution has been enabled using annotation `@cds.persistence.journal`, see [Schema Evolution Support of Native Database Clauses](../../guides/databases/#schema-evolution-native-db-clauses).

::: warning
The compiler doesn’t check or process the provided SQL snippets in any way. You are responsible to ensure that the resulting statement is valid and doesn’t negatively impact your database or your application. We don’t provide support for problems caused by using this feature.
:::

### Using Special Variables

The CDS language supports some special variables that translate to database-specific expressions. When the compiler translates CQL to SQL, for some of these special variables there is a default translation to a suitable SQL expression. The translation can be controlled via the option `variableReplacements`. These variables start with a `$` - supported are [`$user`](#user), [`$session`](#session), [`$now`](#now) and [`$at`](#at).

#### Configuring Variables

Replacement of variables is possible using Compiler option `variableReplacements` - one way to pass that in is using the `cdsc` subsection of the `cds`-config in the _package.json_.
::: warning
Variable replacements are only possible for view definitions.
:::

The option expects an object, where the top-level keys are the "root"-variable name. The following object-keys are the path steps and the values of the leaf-element is the replacement value. The following sample illustrates this:

```jsonc
{
  "variableReplacements": {
    "$user": {
      // replacement for $user and $user.id
      "id": "userid",
      // replacement for $user.locale
      "locale": "DE",
      "foo": {
        // replacement for $user.foo.bar
        "bar": "foobar"
      }
    },
    "$session": {
      "some": {
        "path": {
          // replacement for $session.some.path.firstName
          "firstName": "firstName",
          // replacement for $session.some.path.lastName
          "lastName": "lastName"
        }
      }
    }
  }
}
```

For different databases, different replacement values need to be defined. This can be achieved using [profiles](../../node.js/cds-env#profiles).

#### $user

The `$user` variable can be used as-is, or it's child properties `id` and `locale` can be used. `$user` is a shortcut for `$user.id as $user`.

The variables `$user` and `$user.id` are only supported for HANA out-of-the-box - for other database dialects, they need to be configured. For dialect `plain` and `sqlite`, the default locale `en` is used for `$user.locale`.

There is also the possibility to use arbitrary child properties - but without a [valid configuration](#configuring-variables), those will lead to an error when compiling into database artifacts.

| | `$user(.id)` | `$user.locale` |
| :--- | --- | ----|
| `hana` | SESSION_CONTEXT('APPLICATIONUSER') |  SESSION_CONTEXT('LOCALE') |
| `sqlite` | - | 'en' |
| `plain` | - | 'en' |

#### $session

The `$session` variable (and any arbitrary child properties) are accepted during compilation, but without a [valid configuration](#configuring-variables) they will lead to errors when generating database artifacts.

#### $now

The `$now` variable can be used to reference the current timestamp. The variable does not have any child properties. Configuration of this variable is _not_ possible.

|  | `$now`
| :--- | ----
| `hana` \| `sqlite` \| `plain` | CURRENT_TIMESTAMP


#### $at

The `$at` variable is used in the context of temporal data, but it can also be used independently. `$at` is a structured element with two subelements `from` and `to`. Configuration of this variable is _not_ possible.


|  | `$at.from` | `$at.to` |
| :--- | --- | ----|
| `hana` | TO_TIMESTAMP(SESSION_CONTEXT('VALID-FROM')) | TO_TIMESTAMP(SESSION_CONTEXT('VALID-TO')) |
| `sqlite` | strftime('%Y-%m-%dT%H:%M:%S.000Z', 'now') | strftime('%Y-%m-%dT%H:%M:%S.000Z', 'now') |
| `plain` | current_timestamp | current_timestamp |

<!--- {% assign x="<span style='color:#4FB81C' title='Available'>&#10004;</span>" %} -->
<!--- {% assign na="<i style='color:#eb3434; font-size:90%'>X</i>" %} -->

## Schema Evolution {:#schema-evolution}

CAP supports database schema updates by detecting changes to the CDS model when executing the CDS build. If the underlying database offers built-in schema migration techniques, compatible changes can be applied to the database without any data loss or the need for additional migration logic. Incompatible changes like deletions are also detected, but require manual resolution, as they would lead to data loss.

| Change                              | Detected Automatically         |
|-------------------------------------|:------------------------------:|
| Adding   fields                     |         <span style='color:#4FB81C' title='Available'>&#10004;</span>                  |
| Deleting fields                     |         <span style='color:#4FB81C' title='Available'>&#10004;</span>                  |
| Renaming fields                     |         <i style='color:#eb3434; font-size:90%'>X</i> <sup>1</sup>    |
| Changing datatype of fields         |         <span style='color:#4FB81C' title='Available'>&#10004;</span>                  |
| Changing type parameters            |         <span style='color:#4FB81C' title='Available'>&#10004;</span>                  |
| Changing associations/compositions  |         <span style='color:#4FB81C' title='Available'>&#10004;</span>                  |
| Renaming associations/compositions  |         <i style='color:#eb3434; font-size:90%'>X</i> <sup>1</sup>    |
| Renaming entities                   |         <i style='color:#eb3434; font-size:90%'>X</i>                 |

> <sup>1</sup> Rename field or association operations aren't detected as such. Instead, corresponding ADD and DROP statements are rendered requiring manual resolution activities.

::: warning
Currently there's no framework support for incompatible schema changes that require scripted data migration steps (like changing field constraints NULL > NOT NULL). However, the CDS build does detect those changes renders them as non-executable statements, requesting the user to take manual resolution steps. We recommend avoiding those changes in productive environments.
:::

### Schema Evolution and Multitenancy/Extensibility

There's full support for schema evolution when the _cds-mtx_ library is used for multitenancy handling. It ensures that all schema changes during base-model upgrades are rolled out to the tenant databases.

::: warning
Tenant-specific extensibility using the _cds-mtx_ library isn't supported yet. Right now you can't activate extensions on entities annotated with `@cds.persistence.journal`.
:::

### Schema Updates with SAP HANA {:#schema-updates-with-sap-hana}

All schema updates in SAP HANA are applied using SAP HANA Deployment Infrastructure (HDI) design-time artifacts, which are auto-generated during CDS build execution. For backward compatibility, the default artifact type is still _.hdbcds_.
::: warning
This will be changed to _.hdbtable_/_.hdbview_ artifact generation, as the support of _.hdbcds_ has been discontinued in [SAP HANA Cloud](https://help.sap.com/docs/HANA_CLOUD_DATABASE/3c53bc7b58934a9795b6dd8c7e28cf05/eeffc091d9704d5bae57b6943f1d31d6.html).
:::

Schema updates using _.hdbtable_ deployments are a challenge for tables with large data volume compared to _.hdbcds_. Schema changes with _.hdbtable_ are applied using temporary table generation to preserve the data. As this could lead to long deployment times, the support for _.hdbmigrationtable_ artifact generation has been added. The [Migration Table artifact type](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c2cc2e43458d4abda6788049c58143dc/52d1f5acfa754a7887e21226641eb261.html) uses explicit versioning and migration tasks. Modifications of the database table are explicitly specified in the design-time file and carried out on the database table exactly as specified. This saves the cost of an internal table-copy operation. When a new version of an already existing table is deployed, HDI performs the migration steps that haven't been applied.

#### Deploy Artifact Transitions as Supported by HDI {:#deploy-artifact-transitions}

| Current format    | hdbcds | hdbtable | hdbmigrationtable |
|-------------------|:------:|:--------:|:-----------------:|
| hdbcds            |        |   <span style='color:#4FB81C' title='Available'>&#10004;</span>  |       <i style='color:#eb3434; font-size:90%'>X</i>      |
| hdbtable          | <i style='color:#eb3434; font-size:90%'>X</i> |          |       <span style='color:#4FB81C' title='Available'>&#10004;</span>       |
| hdbmigrationtable | <i style='color:#eb3434; font-size:90%'>X</i> |   <span style='color:#4FB81C' title='Available'>&#10004;</span>  |                   |

::: warning
Direct migration from _.hdbcds_ to _.hdbmigrationtable_ isn't supported by HDI. A deployment using _.hdbtable_ is required upfront.
[Learn more in the **Enhance Project Configuration for SAP HANA Cloud** section.](../../guides/databases/#configure-hana){:.learn-more}
During the transition from _.hdbtable_ to _.hdbmigrationtable_ you have to deploy version=1 of the _.hdbmigrationtable_ artifact which may not include any migration steps.
:::

HDI supports the _hdbcds > hdbtable > hdbmigrationtable_ migration flow without data loss. Even going back from _.hdbmigrationtable_ to _.hdbtable_ is possible. Keep in mind that you lose the migration history in this case.
For all transitions you want to execute in HDI, you need to specify an undeploy allowlist as described in [HDI Delta Deployment and Undeploy Allow List](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c2b99f19e9264c4d9ae9221b22f6f589/ebb0a1d1d41e4ab0a06ea951717e7d3d.html) in the SAP HANA documentation.

#### Enabling hdbmigrationtable Generation for Selected Entities During CDS Build {:#enabling-hdbmigrationtable-generation}

If you are migrating your already deployed scenario to _.hdbmigrationtable_ deployment, you have to consider the remarks in [Deploy Artifact Transitions as Supported by HDI](#deploy-artifact-transitions)

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
::: tip
These source files have to be checked into the version control system.
:::

Subsequent model changes are applied automatically as respective migration versions including the required schema update statements to accomplish the new target state.
There are cases where you have to resolve or refactor the generated statements, like for reducing field lengths. As they can't be executed without data loss (for example, `String(100)` -> `String(50)`), the required migration steps are only added as comments for you to process explicitly.

Example:

```
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

1. Changing the type of a field from String to Integer may cause tenant updates to fail if existing content cannot be converted.
2. Changing the type of a field from Decimal to Integer can succeed, but decimal places are truncated. Conversion fails if the content exceeds the maximum Integer length.

We recommend keeping _.hdbtable_ deployment for entities where you expect low data volume. Every _.hdbmigrationtable_ artifact becomes part of your versioned source code, creating a new migration version on every model change/build cycle. In turn, each such migration can require manual resolution.
You can switch large-volume tables to _.hdbmigrationtable_ at any time, keeping in mind that the existing _.hdbtable_ design-time artifact needs to be undeployed.
::: tip
Sticking to _.hdbtable_ for the actual application development phase avoids lots of initial migration versions that would need to be applied to the database schema.
:::

CDS build performs rudimentary checks on generated _.hdmigrationtable_ files:

- CDS build fails if inconsistencies are encountered between the generated _.hdbmigrationtable_ files and the _last-dev/csn.json_ model state. For example, the last migration version not matching the table version is such an inconsistency.
- CDS build fails if manual resolution comments starting with `>>>>>` exist in one of the generated _.hdbmigrationtable_ files. This ensures that manual resolution is performed before deployment.

### Native Database Clauses {:#schema-evolution-native-db-clauses}
Not all clauses supported by SQL can directly be written in CDL syntax. To use native database clauses also in a CAP CDS model, you can provide arbitrary SQL snippets with the annotations `@sql.prepend` and `@sql.append` as described in [Native Database Features](../../guides/databases/#native-db-clauses). In this section we are focusing on schema evolution specific details.

Schema evolution requires that any changes are applied by corresponding ALTER statements. See [ALTER TABLE statement reference](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c1d3f60099654ecfb3fe36ac93c121bb/20d329a6751910149d5fdbc4800f92ff.html) for more information. A new migration version will be generated whenever an `@sql.append` or `@sql.prepend` annotation is added, changed, or removed. ALTER statements define the individual changes that create the final database schema. This schema has to match the schema defined by the TABLE statement in the _.hdbmigrationtable_ artifact.
Please note that the compiler does not evaluate or process these SQL snippets. Any snippet will be taken as is and inserted into the TABLE statement and the corresponding ALTER statement. The deployment will fail in case of syntax errors.

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
```
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
You can use `@sql.append` to partition your table initially, but you cannot subsequently change the partitions using schema evolution techniques as altering partitions isn't supported yet.
:::

### Advanced Options
The following CDS configuration options are supported to manage _.hdbmigrationtable_ generation.
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

The `change-mode` option determines whether `ALTER TABLE ... ALTER` (`"alter"`) or `ALTER TABLE ... DROP` (`"drop"`) statements are rendered for data type related changes. To ensure that any kind of model change can be successfully deployed to the database, you can switch the `"change-mode"` to `"drop"`, keeping in mind that any existing data will be deleted for the corresponding column. See [hdbmigrationtable Generation](../../guides/databases/#enabling-hdbmigrationtable-generation) for more details. The default value is `"alter"`.


### Schema Evolution for SQLite (beta) {:#schevo-sqlite}
::: warning
This is a beta feature. Its configuration and how it works may change in future releases.
:::

Schema evolution for SQLite is handled by `cds deploy`.
To enable automatic schema evolution enhance the database configuration:

::: code-group
```json [package.json: cds > requires]
"db": {
    "kind": "sqlite",
    "schema_evolution": "auto"
}
```
:::

Instead of `DROP/CREATE` for all database objects, model changes are now deployed to the database
by evolving the schema, if possible.

#### Behind the Scenes

When the flag `schema_evolution` is set, the `cds deploy` command looks for an `as-of-now`-CSN in the database, compares it against the currently
`to-be-deployed`-CSN, and calculates the delta. If no `as-of-now`-CSN exists in the database, either because it's an empty database or because it's
the first deployment with `schema_evolution`, no delta can be calculated and the usual drop-create mechanism is used.

After deployment, the `to-be-deployed`-CSN is saved as the new `as-of-now`-CSN and is used as the base for the next deployment.

When automatic schema evolution is disabled, we remove the `as-of-now`-CSN from the database to avoid working on stale data going forward.

#### Limitations

Automatic schema evolution only works with compatible model changes, which are changes without potential data loss.
This implies restrictions for entities represented on the database as tables.

Supported:
- Adding an entity
- Adding an element
- Extending the length of an element

Not supported:
- Removing an entity
- Removing an element
- Changes to the Primary Key
- Reducing the length of an element
- Other type changes

Unsupported changes lead to an error during deployment. To bring such changes to the database, switch off automatic schema evolution.

<!--- {% assign x="<span style='color:#4FB81C' title='Available'>&#10004;</span>" %} -->
<!--- {% assign na="<i style='color:#eb3434; font-size:90%'>X</i>" %} -->


## Database Constraints {:#db-constraints}

The information about foreign key relations contained in the associations of CDS models can be used to generate foreign key constraints on the database tables.

Switch on generation of foreign key constraints on the database with:

```
cds.features.assert_integrity: 'db'
```
::: warning
Database constraints are not intended for checking user input. Instead, they protect
the integrity of your data in the database layer against programming errors.
:::

If a constraint violation occurs, the error messages coming from the database aren't standardized
by the runtimes but presented as-is.

### For Managed To-One Associations

A foreign key constraint is generated for each managed to-one association or composition in an entity, if that entity and the target entity are represented by tables in the database.  This includes the generated backlinks of managed compositions of aspects.
The constraint ties the foreign key fields (that are automatically added for a managed association) to the respective primary key fields of the target table.

In the following example, association `author` of entity `Books` triggers the generation of a foreign key constraint.

Modeled association:

```cds
entity Books {
  key ID : Integer;
  ...
  author : Association to Authors;
}
entity Authors {
  key ID : Integer;
  ...
}
```

Generated database tables with constraint:

```sql
CREATE TABLE Authors (
  ID INTEGER NOT NULL,  -- primary key referenced by the constraint
  ...,
  PRIMARY KEY(ID)
);
CREATE TABLE Books (
  ID INTEGER NOT NULL,
  author_ID INTEGER,    -- generated foreign key field
  ...,
  PRIMARY KEY(ID),
  CONSTRAINT Books_author
    FOREIGN KEY(author_ID)  -- link generated foreign key field author_ID ...
    REFERENCES Authors(ID)  -- ... with primary key field ID of table Authors
    ON UPDATE RESTRICT
    ON DELETE RESTRICT
    VALIDATED           -- validate existing entries when constraint is created
    ENFORCED            -- validate changes by insert/update/delete
    INITIALLY DEFERRED  -- validate only at commit
)
```

For the following cases no constraints are generated:
* Associations are annotated with `@assert.integrity: false`
* The source or target entity of the association is annotated with `@cds.persistence.exists` or `@cds.persistence.skip`

### For Compositions

If an association `<assoc>` is the backlink of a composition `<comp>` (that means, the ON condition of `<comp>` is `<comp>.<assoc> = $self`),
then the delete rule for the association's constraint is changed to `CASCADE`. There is no constraint for the composition itself.

```cds
entity Genres {
  key ID   : Integer;
  ...
  parent   : Association to Genres;
  children : Composition of many Genres on children.parent = $self;
}
```

A constraint is generated for `parent`, which is `on delete cascade` due to the composition `children`:

```sql
CREATE TABLE Genres (
  ID INTEGER NOT NULL,  -- primary key referenced by the constraint
  ...
  parent_ID INTEGER,    -- generated foreign key field
  PRIMARY KEY(ID),
  CONSTRAINT Genres_parent
    FOREIGN KEY(parent_ID)  -- link generated foreign key field parent_ID ...
    REFERENCES Genres(ID)   -- ... with primary key field ID
    ON UPDATE RESTRICT
    ON DELETE CASCADE
    VALIDATED
    ENFORCED
    INITIALLY DEFERRED
)
```


### SAP HANA-Specific Remarks

For SAP HANA, the database constraints are generated as separate _.hdbconstraint_ files. To enforce that the constraints are deleted on SAP HANA if they are no longer in the model, ensure that you have a file _db/undeploy.json_ that contains an entry:

```
"src/gen/**/*.hdbconstraint"
```


### Limitations

Database constraints are only generated for managed to-one associations or to-one compositions. Everything else will not get constraints, like:
* Unmanaged associations or compositions
* Associations or compositions with cardinality to-many

Constraints are only generated for SQL dialects `hana` and `sqlite`.

## Reserved Words and Keywords

Reserved words have a special meaning and can't be used, for example, as identifiers. The list of reserved words depends on the database.

The CDS compiler has a special treatment for the reserved words of SQLite and SAP HANA so that they can still be used in most situations.
But for other databases this is not the case. Find here a collection of resources on selected databases and their reference documentation:

* [SAP HANA SQL Reference Guide for SAP HANA Platform (Cloud Version)](https://help.sap.com/docs/HANA_SERVICE_CF/7c78579ce9b14a669c1f3295b0d8ca16/28bcd6af3eb6437892719f7c27a8a285.html)
* [SAP HANA SQL Reference Guide for SAP HANA Cloud](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c1d3f60099654ecfb3fe36ac93c121bb/28bcd6af3eb6437892719f7c27a8a285.html)
* [SQLite Keywords](https://www.sqlite.org/lang_keywords.html)
* [H2 Keywords/Reserved Words](http://www.h2database.com/html/advanced.html#keywords)

{% if jekyll.environment != "external" %}
[There also reserved words related to SAP Fiori.](../../advanced/fiori#reserved-words){:.learn-more}
{% endif %}

## Auto-Generating Primary Keys {: .impl.concept}

TODO:

* Using UUID &rarr; filled in by CAP framework
* Using custom event handlers
* Using native DB mechanisms like SQLite's rowid, SAP HANA's generated always as, ...
* Using DB triggers
* ...


## Integrating Other Databases {: .impl.concept}

For CAP Java persistence support, see [here].
