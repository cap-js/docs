---
shorty: Moving from .hdbcds to .hdbtable
synopsis: >
  This document describes the migration from .hdbcds-based HDI deployment to .hdbtable-based HDI deployment.

# layout: cds-ref
redirect_from: releases/compiler-v2
status: internal
---

# Moving from deploy format `hdbcds` to `hdbtable`

{{ $frontmatter.synopsis }}

::: info
Not relevant for SAP HANA Cloud.
:::

With @sap/cds-compiler@5 and @sap/cds@8, we have deprecated the deploy format `hdbcds` for SAP HANA,
together with the function [`to.hdbcds`](../node.js/cds-compile#hdbcds).
New CDS features will not be available for deploy format `hdbcds`, and it is going to be removed with one of the
next major releases.

In case your database deployment is still based on `hdbcds`, you should move to the default format `hdbtable`
with the following 4 steps. This guide assumes you use @sap/cds@7 or higher.

Info: The deploy format determines only the "medium" how your database model is brought to the database.
The resulting database tables and views are the same, independent of the deploy format.

1. Ensure your current data model is actually the deployed data model.
   <!-- **TBD** must it be exactly the same? Does it also work if the current model
                is changed in comparison to the last deployed model. -->

2. Switch the deploy format from `hdbcds` to the default `hdbtable` by removing option `cds.requires.db.deploy-format`
   from your configuration file(s).
   <!-- requires @sap/cds v7 -->
   <!-- this option is not documented, but mentioned in release notes and the changelog -->

3. Add an entry to `db/undeploy.json` to undeploy the CAP-generated `.hdbcds` files:

::: code-group

```json [db/undeploy.json]
[
  ...,
  "src/gen/**/*.hdbcds"
]
```
:::

<!-- **TODO** Without this entry, during HDI deployment you will get errors like ... -->

4. Build and re-deploy your data model.


There is a handover mechanism inside HDI that, when following the above steps, simply switches ownership of the tables
to the hdbtable plugin. There are some caveats, however:

* If you used annotations `@sql.append` or `sql.prepend`, your model very likely needs to be adapted manually
  before the  migration can be done. See the corresponding section below for more details.
* In some scenarios, the generated hdbcds and hdbtable files do not allow a seamless switchover,
  and a full migration is done for the respective tables.
  The scenarios we have identified so far are explained in separate sections below, for two of them there is a workaround.

::: info Full Table Migration

If HDI detects a difference between the CREATE statement in a hdbtable file and the already deployed
version of a table, it creates a temporary shadow table based on the new structure and copies
existing data into this shadow table.

If the table doesn't contain much data, that should not make that much of a difference.
With huge amounts of data, you have to expect a longer and more resource intensive deployment.

:::


## @sql.append and @sql.prepend

Annotations [`@sql.append/prepend`](../guides/databases#sql-prepend-append) allow to
add native SQL clauses to the generated .hdbtable files,
or to add "native" HANA CDS clauses to the generated .hdbcds files, respectively.

If you have used these annotations in your model, a simple switchover from hdbcds to hdbtable
very likely is not possible, as such an annotation written for hdbcds in general is not valid
for hdbtable. You have to adapt your model prior to the migration.

As we don't know what clauses you have used, we cannot offer any further guidance here.


## `WITH ASSOCIATIONS`

Associations cause issues in the .hdbcds to .hdbtable handover.
For each entity that has associations, the resulting table or view contains a `WITH ASSOCIATIONS` clause,
representing native HANA associations.
This clause slightly differs, depending on whether it originates from a .hdbcds or a .hdbtable/.hdbview file,
which would causes a full table migration.

The CAP Java runtime and the CAP Nodejs runtime with the new SAP HANA service (`@cap-js/hana`, default in CDS 8)
don't need the `WITH ASSOCIATIONS` clause anymore. The workaround is to remove the `associations` from the `hdbcds` sources
__before__ the actual `hdbcds` to `hdbtable` migration.

First switch of the generation of the `associations` (that option accounts for "associations" in the `hdbcds` sources as well as for the `WITH ASSOCIATIONS` found in the `hdbtable` sources):

::: code-group

```json [.cdsrc.json]
{
  "sql": {
    "native_hana_associations": false
  }
}
```
:::
<!-- this option is available only with CDS 8 -->

Then run a new build and deploy the newly generated `.hdbcds` files.
The resulting database tables and views shouldn't contain any `associations` anymore.
In contrast to the hdbtable plugin, the hdbcds plugin is able to handle removal of the
native associations without a full table migration.

::: warning Requirements

This workaround requires
* CAP CDS 8,
* that you use CAP Java or the CAP Nodejs runtime with the new HANA database service `@cap-js/hana`,
* and that your custom coding doesn't use the native associations on the database.

:::


<!--
  full syntax in mta for try_fast is:
  com.sap.hana.di.table/try_fast_table_migration: "true"
-->


## Multiline Doc Comments

This is only relevant if you have switched on [Doc Comments](../cds/cdl#doc-comments-%E2%80%94)
and if you have enabled translation of doc comments to the `COMMENT` feature in the database.

<!--
::: code-group
```json [cdsrc.json]
{
  "docs": true,
  "hana": {
    "comments": true
  }
}
```
:::
-->

Doc comments can span across multiple lines:

```cds
entity Employees {
  key ID : Integer;
  /**
    * I am the description for "name".
    * I span across multiple lines.
    */
  name : String;
}
```

An entity with such a multi-line doc comment can't be seamlessly migrated, because
doc comments are passed to the database differently for hdbcds and hdbtable, respectively.
This would result in a full table migration when changing from hdbcds to hdbtable.

If you don't actually need the comments in the database, you can remove them as a preparation step
__before__ you do the hdbcds to hdbtable migration.
This is similar to the workaround described above for the `WITH ASSOCIATIONS` clause.
First disable the doc comments by setting option `hana.comments` to `false`.
Then run a new build and deploy the newly generated `.hdbcds` files.
The resulting database tables and views shouldn't contain the `COMMENT` clause anymore.
In contrast to the hdbtable plugin, the hdbcds plugin is able to handle removal of the
`COMMENT`s without a full table migration.

<!-- verify: can hdbcds easily drop comments? -->


## Temporal Data with Time Slice IDs

Temporal Data with [Time Slice IDs](../guides/temporal-data#adding-time-slice-ids)
is a conceptual feature, thus it shouldn't occur in productive applications.
We nevertheless mention it here for completeness.

Example:
```cds
// usually taken from '@sap/cds/common'
aspect temporal {
  validFrom : Timestamp @cds.valid.from;
  validTo   : Timestamp @cds.valid.to;
}

entity TimeDependentData : temporal {
  key ID  : UUID;
  sliceId : UUID @cds.valid.key;
  someData : String;
}
```

In this example, entity `TimeDependentData` can't be seamlessly migrated and a full table migration will take place.
