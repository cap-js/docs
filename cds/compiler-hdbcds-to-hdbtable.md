---
shorty: Moving from .hdbcds to .hdbtable
synopsis: >
  This document describes the issues to expect when migrating from .hdbcds-based HDI deployment to .hdbtable-based HDI deployment.

# layout: cds-ref
redirect_from: releases/compiler-v2
status: internal
---

# Moving from deploy format `hdbcds` to `hdbtable`

{{ $frontmatter.synopsis }}

With @sap/cds-compiler@5 and @sap/cds@8, we have deprecated the deploy format `hdbcds` for SAP HANA,
together with the function [`to.hdbcds`](../node.js/cds-compile#hdbcds).
New CDS features will not be available for deploy format `hdbcds`, and it is going to be removed with one of the
next major releases.

In case your database deployment is still based on `hdbcds`, you should move to the default format `hdbtable`
with the following 4 steps. This guide assumes you use @sap/cds@7 or higher.

Info: The deploy format determines only the "medium" how your database model is brought to the database.
The resulting database tables and views are the same, independent of the deploy format.

1. Ensure your current data model is actually the deployed data model.
   **TBD** must it be exactly the same? Does it also work if the current model
           is changed in comparison to the last deployed model.

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

**TODO** Without this entry, during HDI deployment you will get errors like ...

4. Build and re-deploy your data model.


In theory, there is an intelligent handover mechanism when following the above steps that inside of HDI simply switches ownership of the tables to the .hdbtable plugin and does not require a full table migration. In practice, there are some scenarios where the .hdbcds we generate and the .hdbtable we generate do not allow a seamless migration.

If the tables do not contain much data, it should not make that much of a difference. With huge amounts of data, expect a longer and more resource intensive deployment!

So far we've identified the following scenarios where a seamless migration is not possible - one of them with a workaround:

## `WITH ASSOCIATIONS`

Unfortunately associations cause issues in our .hdbcds to .hdbtable handover. With the option `withHanaAssociations`, you can ensure that associations will not be part of the .hdbcds and .hdbtable files and therefore not hinder the migration.

This only works if your custom coding does not use these associations on the database.

::: code-group

```json [cdsrc.json]
{
  "cdsc": {
    "withHanaAssociations": false
  }
}
```
:::

Once you've set this option, run a new build of your .hdbcds artifacts. The should not contain the associations anymore. Deploy these newly generated files and then proceed with the steps described initially.

**TODO** requires that for node the new db drivers are used

<!-- todo: show effect of the option? -->


## timesliced temporal/@cds.valid.key

```cds
namespace com.acme.hr;
using { temporal } from '@sap/cds/common';
using { com.acme.common.Persons } from './common';

entity Employees : Persons {
  jobs : Composition of many WorkAssignments on jobs.empl=$self;
  job1 : Association to one /*of*/ WorkAssignments;
}

entity WorkAssignments: temporal {
  key ID  : UUID;
  sliceId : UUID @cds.valid.key; // ID of the time slice
  role    : String(111);
  empl    : Association to Employees;
  dept    : Association to Departments;
}

entity Departments {
  key ID  : UUID;
  name    : String(111);
  head    : Association to Employees;
  members : Association to many Employees on members.jobs.dept = $self;
}
```

In the above sample, the entity `TemporalWithTimeSliceId` can't be seamlessly migrated and a full table migration will take place.

## Multiline doc comments

```cds
entity Employees {
  key ID : Integer;
  /**
    * I am the description for "name".
    * I span across multiple lines.
    *
    * With multiple paragraphs.
    */
  name : String;
}
```

In the above sample, the entity `Service.BaseEntity` can't be seamlessly migrated and a full table migration will take place. This is due to a difference in the way `doc`-comments are passed to the database.

::: code-group

```json [cdsrc.json]
{
  "hana": {
    "comments": true
  }
}
```
:::

<!-- todo: can hdbcds easily drop comments? -->

If you don't actually need the comments on database-level, then you can disable them with option `hana.comments`. Once you've set this option, run a new build of your .hdbcds artifacts. The should not contain the associations anymore. Deploy these newly generated files and then proceed with the steps described initially.

## @sql.append and @sql.prepend

Native database features added via `@sql.append` and `@sql.prepend` might work or might not - we cannot offer any guidance here.

